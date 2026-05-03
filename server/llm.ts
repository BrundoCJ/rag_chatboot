import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "./_core/env";

const genAI = new GoogleGenerativeAI(ENV.geminiApiKey);

const chatModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

export const EMBEDDING_MODEL = "gemini-embedding-001";

export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

export async function generateChatResponse(
  userMessage: string,
  context: string,
  history: Array<{ role: "user" | "model"; parts: string }>
): Promise<string> {
  const systemPrompt = context
    ? `Você é um assistente prestativo. Use o contexto abaixo para responder a pergunta do usuário. Se a resposta não estiver no contexto, responda com base no seu conhecimento geral, mas indique isso.

CONTEXTO DOS DOCUMENTOS:
${context}

---`
    : "Você é um assistente prestativo. Responda de forma clara e objetiva.";

  const chat = chatModel.startChat({
    history: [
      { role: "user", parts: [{ text: systemPrompt }] },
      { role: "model", parts: [{ text: "Entendido! Vou usar o contexto fornecido para responder suas perguntas." }] },
      ...history.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.parts }],
      })),
    ],
  });

  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}
