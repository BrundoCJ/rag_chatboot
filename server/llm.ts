import Groq from "groq-sdk";
import { ENV } from "./_core/env";

const groq = new Groq({ apiKey: ENV.groqApiKey });

export const EMBEDDING_MODEL = "local-bow-512";

// Embedding local via bag-of-words com hashing — sem custo de API
export function generateEmbedding(text: string): number[] {
  const DIMS = 512;
  const vec = new Array(DIMS).fill(0);
  const words = text.toLowerCase().match(/\w+/g) ?? [];

  for (const word of words) {
    let hash = 5381;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) + hash + word.charCodeAt(i)) & 0x7fffffff;
    }
    vec[hash % DIMS] += 1;
  }

  const mag = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
  return mag === 0 ? vec : vec.map((v) => v / mag);
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

  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...history.map((msg) => ({
      role: msg.role === "model" ? ("assistant" as const) : ("user" as const),
      content: msg.parts,
    })),
    { role: "user", content: userMessage },
  ];

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    temperature: 0.7,
    max_tokens: 1024,
  });

  return response.choices[0]?.message?.content ?? "Sem resposta.";
}
