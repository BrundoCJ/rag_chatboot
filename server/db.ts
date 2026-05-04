import { and, desc, eq } from "drizzle-orm";
import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import path from "path";
import * as schema from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: BetterSQLite3Database<typeof schema> | null = null;

export const getTimestamp = (date?: Date): number => {
  if (date instanceof Date) {
    return Math.floor(date.getTime() / 1000);
  }
  return Math.floor(Date.now() / 1000);
};

export async function getDb() {
  if (!_db) {
    try {
      const databasePath = path.resolve(process.cwd(), "rag_chatbot.db");
      const sqliteDb = new Database(databasePath);
      _db = drizzle(sqliteDb, { schema });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// User operations
export async function upsertUser(user: {
  openId: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  role?: string;
  lastSignedIn?: number;
}) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: any = { openId: user.openId };
    const updateSet: any = {};

    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field: string) => {
      const value = (user as any)[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }

    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = getTimestamp();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = getTimestamp();
    }

    const existingUser = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.openId, user.openId))
      .limit(1);

    if (existingUser.length > 0) {
      await db
        .update(schema.users)
        .set(updateSet)
        .where(eq(schema.users.openId, user.openId));
    } else {
      await db.insert(schema.users).values(values);
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.openId, openId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Document operations
export async function createDocument(
  input: typeof schema.documents.$inferInsert
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(schema.documents).values(input).returning();
  const created = result[0];
  if (!created?.id) throw new Error("Failed to create document record");

  return getDocumentById(created.id);
}

export async function updateDocument(
  documentId: number,
  patch: Partial<typeof schema.documents.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(schema.documents)
    .set(patch)
    .where(eq(schema.documents.id, documentId));
  return getDocumentById(documentId);
}

export async function getDocumentById(documentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(schema.documents)
    .where(eq(schema.documents.id, documentId))
    .limit(1);
  return result[0];
}

export async function listDocuments() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(schema.documents)
    .orderBy(desc(schema.documents.createdAt));
}

export async function replaceDocumentChunks(
  documentId: number,
  chunks: (typeof schema.documentChunks.$inferInsert)[]
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(schema.documentChunks)
    .where(eq(schema.documentChunks.documentId, documentId));

  if (chunks.length > 0) {
    // Drizzle não serializa number[] para TEXT automaticamente — força JSON
    // e insere em lotes de 20 para não exceder o limite de 999 params do SQLite
    const serialized = chunks.map((c) => ({
      ...c,
      embedding: JSON.stringify(c.embedding) as any,
    }));
    const BATCH_SIZE = 20;
    for (let i = 0; i < serialized.length; i += BATCH_SIZE) {
      await db.insert(schema.documentChunks).values(serialized.slice(i, i + BATCH_SIZE));
    }
  }

  return db
    .select()
    .from(schema.documentChunks)
    .where(eq(schema.documentChunks.documentId, documentId))
    .orderBy(schema.documentChunks.chunkIndex);
}

export async function listReadyChunkCandidates() {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select({
      chunkId: schema.documentChunks.id,
      documentId: schema.documentChunks.documentId,
      documentTitle: schema.documents.title,
      content: schema.documentChunks.content,
      embedding: schema.documentChunks.embedding,
      topicLabel: schema.documentChunks.topicLabel,
    })
    .from(schema.documentChunks)
    .innerJoin(
      schema.documents,
      eq(schema.documentChunks.documentId, schema.documents.id)
    )
    .where(eq(schema.documents.status, "ready"));

  return rows.map((row) => {
    let embedding: number[] = [];
    try {
      const raw = row.embedding as any;
      if (typeof raw === "string") embedding = JSON.parse(raw);
      else if (Array.isArray(raw)) embedding = raw.map(Number);
    } catch {}
    return { ...row, embedding };
  });
}

// Conversation operations
export async function createConversation(
  input: typeof schema.conversations.$inferInsert
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(schema.conversations).values(input);
  return getConversationById(input.id);
}

export async function getConversationById(conversationId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(schema.conversations)
    .where(eq(schema.conversations.id, conversationId))
    .limit(1);
  return result[0];
}

export async function getConversationForSession(
  conversationId: string,
  sessionId: string
) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(schema.conversations)
    .where(
      and(
        eq(schema.conversations.id, conversationId),
        eq(schema.conversations.sessionId, sessionId)
      )
    )
    .limit(1);
  return result[0];
}

export async function listConversationsForSession(sessionId: string) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(schema.conversations)
    .where(eq(schema.conversations.sessionId, sessionId))
    .orderBy(desc(schema.conversations.lastMessageAt));
}

export async function updateConversationAfterMessage(
  conversationId: string,
  patch: Partial<typeof schema.conversations.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(schema.conversations)
    .set(patch)
    .where(eq(schema.conversations.id, conversationId));
  return getConversationById(conversationId);
}

// Message operations
export async function createMessage(
  input: typeof schema.messages.$inferInsert
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(schema.messages).values(input);
  return getMessageById(input.id);
}

export async function getMessageById(messageId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(schema.messages)
    .where(eq(schema.messages.id, messageId))
    .limit(1);
  return result[0];
}

export async function listMessagesForConversation(conversationId: string) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(schema.messages)
    .where(eq(schema.messages.conversationId, conversationId))
    .orderBy(schema.messages.createdAt);
}

// Feedback operations
export async function upsertMessageFeedback(
  input: typeof schema.messageFeedback.$inferInsert
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existingFeedback = await db
    .select()
    .from(schema.messageFeedback)
    .where(eq(schema.messageFeedback.messageId, input.messageId))
    .limit(1);

  if (existingFeedback.length > 0) {
    await db
      .update(schema.messageFeedback)
      .set({
        value: input.value,
        sessionId: input.sessionId,
        updatedAt: getTimestamp(),
      })
      .where(eq(schema.messageFeedback.messageId, input.messageId));
  } else {
    await db.insert(schema.messageFeedback).values(input);
  }

  const result = await db
    .select()
    .from(schema.messageFeedback)
    .where(eq(schema.messageFeedback.messageId, input.messageId))
    .limit(1);
  return result[0];
}

export async function listMessageFeedback() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(schema.messageFeedback)
    .orderBy(desc(schema.messageFeedback.createdAt));
}

// RAG Events
export async function createRagEvent(
  input: typeof schema.ragEvents.$inferInsert
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(schema.ragEvents).values(input).returning();
  const created = result[0];
  if (!created?.id) throw new Error("Failed to create RAG event");

  const selectResult = await db
    .select()
    .from(schema.ragEvents)
    .where(eq(schema.ragEvents.id, created.id))
    .limit(1);
  return selectResult[0];
}

export async function listRagEvents() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(schema.ragEvents)
    .orderBy(desc(schema.ragEvents.createdAt));
}

// Delete operations
export async function deleteConversation(conversationId: string, sessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(schema.conversations)
    .where(
      and(
        eq(schema.conversations.id, conversationId),
        eq(schema.conversations.sessionId, sessionId)
      )
    );
}

export async function clearAllConversations(sessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(schema.conversations)
    .where(eq(schema.conversations.sessionId, sessionId));
}

export async function deleteDocument(documentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(schema.documents).where(eq(schema.documents.id, documentId));
}
