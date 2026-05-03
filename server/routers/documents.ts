import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import {
  createDocument,
  updateDocument,
  listDocuments,
  replaceDocumentChunks,
} from "../db";
import { processPdfDocument } from "../rag";

export const documentsRouter = router({
  list: publicProcedure.query(async () => {
    return listDocuments();
  }),

  upload: publicProcedure
    .input(
      z.object({
        filename: z.string(),
        mimeType: z.string(),
        base64Content: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { filename, mimeType, base64Content } = input;
      const buffer = Buffer.from(base64Content, "base64");

      // Cria registro do documento
      const doc = await createDocument({
        title: filename.replace(/\.pdf$/i, ""),
        originalFilename: filename,
        mimeType,
        storageKey: `local/${Date.now()}_${filename}`,
        storageUrl: "",
        byteSize: buffer.length,
        status: "processing",
      });

      if (!doc) throw new Error("Falha ao criar documento");

      try {
        // Processa PDF e gera embeddings
        const chunks = await processPdfDocument(buffer, doc.id);

        await replaceDocumentChunks(
          doc.id,
          chunks.map((c) => ({
            documentId: doc.id,
            chunkIndex: c.chunkIndex,
            content: c.content,
            embedding: c.embedding,
            embeddingModel: (c as any).embeddingModel ?? "text-embedding-004",
            charCount: c.charCount,
            tokenEstimate: c.tokenEstimate,
          }))
        );

        await updateDocument(doc.id, {
          status: "ready",
          chunkCount: chunks.length,
          processedAt: Math.floor(Date.now() / 1000),
        });

        return { id: doc.id, title: doc.title, chunkCount: chunks.length };
      } catch (error) {
        await updateDocument(doc.id, {
          status: "failed",
          errorMessage: String(error),
        });
        throw error;
      }
    }),
});
