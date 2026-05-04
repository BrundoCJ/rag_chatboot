import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import {
  createConversation,
  createMessage,
  listConversationsForSession,
  listMessagesForConversation,
  getConversationForSession,
  updateConversationAfterMessage,
  deleteConversation,
  clearAllConversations,
} from "../db";
import { findRelevantChunks, buildContextFromChunks } from "../rag";
import { generateChatResponse } from "../llm";
import { randomUUID } from "crypto";
import { getTimestamp } from "../db";

export const chatRouter = router({
  sendMessage: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        conversationId: z.string().optional(),
        message: z.string().min(1).max(4000),
      })
    )
    .mutation(async ({ input }) => {
      const { sessionId, message } = input;

      // Pega ou cria conversa
      let conversationId = input.conversationId;
      if (!conversationId) {
        conversationId = randomUUID();
        await createConversation({
          id: conversationId,
          sessionId,
          title: message.slice(0, 60),
        });
      }

      // Salva mensagem do usuário
      const userMessageId = randomUUID();
      await createMessage({
        id: userMessageId,
        conversationId,
        role: "user",
        content: message,
      });

      // Busca histórico da conversa
      const history = await listMessagesForConversation(conversationId);
      const chatHistory = history
        .slice(0, -1) // exclui a mensagem que acabamos de inserir
        .slice(-10)   // últimas 10 mensagens para contexto
        .map((m) => ({
          role: m.role === "user" ? ("user" as const) : ("model" as const),
          parts: m.content,
        }));

      // RAG: busca chunks relevantes
      const relevantChunks = await findRelevantChunks(message, 5);
      const context = buildContextFromChunks(relevantChunks);

      // Gera resposta com Gemini
      const responseText = await generateChatResponse(message, context, chatHistory);

      // Salva resposta do assistente
      const assistantMessageId = randomUUID();
      await createMessage({
        id: assistantMessageId,
        conversationId,
        role: "assistant",
        content: responseText,
        retrievalCount: relevantChunks.length,
      });

      // Atualiza conversa
      await updateConversationAfterMessage(conversationId, {
        lastMessagePreview: responseText.slice(0, 100),
        lastMessageAt: getTimestamp(),
      });

      return {
        conversationId,
        userMessageId,
        assistantMessageId,
        response: responseText,
        sourcesCount: relevantChunks.length,
      };
    }),

  listConversations: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      return listConversationsForSession(input.sessionId);
    }),

  getMessages: publicProcedure
    .input(z.object({ conversationId: z.string(), sessionId: z.string() }))
    .query(async ({ input }) => {
      const conversation = await getConversationForSession(
        input.conversationId,
        input.sessionId
      );
      if (!conversation) return [];
      return listMessagesForConversation(input.conversationId);
    }),

  deleteConversation: publicProcedure
    .input(z.object({ conversationId: z.string(), sessionId: z.string() }))
    .mutation(async ({ input }) => {
      await deleteConversation(input.conversationId, input.sessionId);
      return { ok: true };
    }),

  clearHistory: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      await clearAllConversations(input.sessionId);
      return { ok: true };
    }),
});
