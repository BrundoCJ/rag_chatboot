import { listReadyChunkCandidates } from "./db";
import { generateEmbedding, EMBEDDING_MODEL } from "./llm";

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

export async function findRelevantChunks(query: string, topK = 5) {
  const queryEmbedding = await generateEmbedding(query);
  const candidates = await listReadyChunkCandidates();

  if (candidates.length === 0) return [];

  const scored = candidates
    .filter((c) => c.embedding.length > 0)
    .map((c) => ({
      ...c,
      score: cosineSimilarity(queryEmbedding, c.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored;
}

export function buildContextFromChunks(
  chunks: Array<{ documentTitle: string; content: string; score: number }>
): string {
  if (chunks.length === 0) return "";

  return chunks
    .map((c, i) => `[${i + 1}] Documento: "${c.documentTitle}"\n${c.content}`)
    .join("\n\n");
}

export async function processPdfDocument(
  pdfBuffer: Buffer,
  documentId: number
): Promise<Array<{ chunkIndex: number; content: string; embedding: number[]; charCount: number; tokenEstimate: number }>> {
  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(pdfBuffer);
  const text = data.text;

  const chunks = splitTextIntoChunks(text, 800, 100);

  const result = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const embedding = await generateEmbedding(chunk);
    result.push({
      chunkIndex: i,
      content: chunk,
      embedding,
      embeddingModel: EMBEDDING_MODEL,
      charCount: chunk.length,
      tokenEstimate: Math.ceil(chunk.length / 4),
    });
  }
  return result;
}

function splitTextIntoChunks(text: string, chunkSize: number, overlap: number): string[] {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 20);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if ((current + para).length > chunkSize && current.length > 0) {
      chunks.push(current.trim());
      const words = current.split(" ");
      current = words.slice(-Math.floor(overlap / 5)).join(" ") + " " + para;
    } else {
      current = current ? current + "\n\n" + para : para;
    }
  }

  if (current.trim().length > 0) chunks.push(current.trim());
  return chunks;
}
