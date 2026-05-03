import {
  integer,
  sqliteTable,
  text,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: integer("createdAt")
    .notNull()
    .$defaultFn(() => Math.floor(Date.now() / 1000)),
  updatedAt: integer("updatedAt")
    .notNull()
    .$defaultFn(() => Math.floor(Date.now() / 1000)),
  lastSignedIn: integer("lastSignedIn")
    .notNull()
    .$defaultFn(() => Math.floor(Date.now() / 1000)),
});

export const documents = sqliteTable(
  "documents",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ownerUserId: integer("ownerUserId").references(() => users.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    originalFilename: text("originalFilename").notNull(),
    mimeType: text("mimeType").notNull(),
    storageKey: text("storageKey").notNull(),
    storageUrl: text("storageUrl").notNull(),
    byteSize: integer("byteSize").default(0).notNull(),
    status: text("status", {
      enum: ["uploaded", "processing", "ready", "failed"],
    })
      .default("uploaded")
      .notNull(),
    chunkCount: integer("chunkCount").default(0).notNull(),
    errorMessage: text("errorMessage"),
    processedAt: integer("processedAt"),
    createdAt: integer("createdAt")
      .notNull()
      .$defaultFn(() => Math.floor(Date.now() / 1000)),
    updatedAt: integer("updatedAt")
      .notNull()
      .$defaultFn(() => Math.floor(Date.now() / 1000)),
  },
  (table) => ({
    ownerIdx: index("documents_owner_idx").on(table.ownerUserId),
    statusIdx: index("documents_status_idx").on(table.status),
  })
);

export const documentChunks = sqliteTable(
  "documentChunks",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    documentId: integer("documentId")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    chunkIndex: integer("chunkIndex").notNull(),
    content: text("content").notNull(),
    embedding: text("embedding").$type<number[]>().notNull(),
    embeddingModel: text("embeddingModel").notNull(),
    charCount: integer("charCount").default(0).notNull(),
    tokenEstimate: integer("tokenEstimate").default(0).notNull(),
    topicLabel: text("topicLabel"),
    createdAt: integer("createdAt")
      .notNull()
      .$defaultFn(() => Math.floor(Date.now() / 1000)),
  },
  (table) => ({
    documentIdx: index("document_chunks_document_idx").on(table.documentId),
    topicIdx: index("document_chunks_topic_idx").on(table.topicLabel),
    uniqueChunkIdx: uniqueIndex("document_chunks_unique_idx").on(
      table.documentId,
      table.chunkIndex
    ),
  })
);

export const conversations = sqliteTable(
  "conversations",
  {
    id: text("id").primaryKey(),
    userId: integer("userId").references(() => users.id, {
      onDelete: "set null",
    }),
    sessionId: text("sessionId").notNull(),
    title: text("title").notNull(),
    lastMessagePreview: text("lastMessagePreview"),
    createdAt: integer("createdAt")
      .notNull()
      .$defaultFn(() => Math.floor(Date.now() / 1000)),
    updatedAt: integer("updatedAt")
      .notNull()
      .$defaultFn(() => Math.floor(Date.now() / 1000)),
    lastMessageAt: integer("lastMessageAt")
      .notNull()
      .$defaultFn(() => Math.floor(Date.now() / 1000)),
  },
  (table) => ({
    sessionIdx: index("conversations_session_idx").on(table.sessionId),
    userIdx: index("conversations_user_idx").on(table.userId),
    lastMessageIdx: index("conversations_last_message_idx").on(
      table.lastMessageAt
    ),
  })
);

export const messages = sqliteTable(
  "messages",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversationId")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["user", "assistant"] }).notNull(),
    content: text("content").notNull(),
    sources: text("sources").$type<any>(),
    fallbackUsed: integer("fallbackUsed").default(0).notNull(),
    retrievalCount: integer("retrievalCount").default(0).notNull(),
    createdAt: integer("createdAt")
      .notNull()
      .$defaultFn(() => Math.floor(Date.now() / 1000)),
  },
  (table) => ({
    conversationIdx: index("messages_conversation_idx").on(
      table.conversationId
    ),
    createdAtIdx: index("messages_created_at_idx").on(table.createdAt),
  })
);

export const messageFeedback = sqliteTable(
  "messageFeedback",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    messageId: text("messageId")
      .notNull()
      .references(() => messages.id, { onDelete: "cascade" }),
    conversationId: text("conversationId")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    sessionId: text("sessionId").notNull(),
    value: text("value", { enum: ["useful", "not_useful"] }).notNull(),
    createdAt: integer("createdAt")
      .notNull()
      .$defaultFn(() => Math.floor(Date.now() / 1000)),
    updatedAt: integer("updatedAt")
      .notNull()
      .$defaultFn(() => Math.floor(Date.now() / 1000)),
  },
  (table) => ({
    messageUniqueIdx: uniqueIndex("message_feedback_message_unique_idx").on(
      table.messageId
    ),
    conversationIdx: index("message_feedback_conversation_idx").on(
      table.conversationId
    ),
    valueIdx: index("message_feedback_value_idx").on(table.value),
  })
);

export const ragEvents = sqliteTable(
  "ragEvents",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    conversationId: text("conversationId")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    userMessageId: text("userMessageId")
      .notNull()
      .references(() => messages.id, { onDelete: "cascade" }),
    assistantMessageId: text("assistantMessageId")
      .notNull()
      .references(() => messages.id, { onDelete: "cascade" }),
    queryText: text("queryText").notNull(),
    normalizedQuestion: text("normalizedQuestion").notNull(),
    topicLabel: text("topicLabel"),
    fallbackUsed: integer("fallbackUsed").default(0).notNull(),
    retrievedChunkCount: integer("retrievedChunkCount").default(0).notNull(),
    topDocumentIds: text("topDocumentIds").$type<number[]>(),
    createdAt: integer("createdAt")
      .notNull()
      .$defaultFn(() => Math.floor(Date.now() / 1000)),
  },
  (table) => ({
    conversationIdx: index("rag_events_conversation_idx").on(
      table.conversationId
    ),
    normalizedQuestionIdx: index("rag_events_question_idx").on(
      table.normalizedQuestion
    ),
    topicIdx: index("rag_events_topic_idx").on(table.topicLabel),
    createdAtIdx: index("rag_events_created_at_idx").on(table.createdAt),
  })
);
