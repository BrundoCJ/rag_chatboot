import { router, publicProcedure } from "../_core/trpc";
import { chatRouter } from "./chat";
import { documentsRouter } from "./documents";

export const appRouter = router({
  health: publicProcedure.query(() => ({ ok: true, timestamp: Date.now() })),
  chat: chatRouter,
  documents: documentsRouter,
});

export type AppRouter = typeof appRouter;
