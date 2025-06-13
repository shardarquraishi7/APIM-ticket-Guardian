import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  vector,
} from 'drizzle-orm/pg-core';

// Define a users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const repos = pgTable('repos', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  owner: text('owner').notNull().default('telus'),
  ref: text('ref').notNull().default('main'),
  lastCommitSha: text('last_commit_sha'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const repoDocuments = pgTable(
  'repo_documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    repoId: integer('repo_id')
      .notNull()
      .references(() => repos.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    sha: text('sha').notNull(),
    path: text('path').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    repoIdPathIdx: uniqueIndex('repo_id_path_idx').on(table.repoId, table.path),
  }),
);

export const repoDocumentEmbeddings = pgTable(
  'repo_document_embeddings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    documentId: uuid('document_id')
      .notNull()
      .references(() => repoDocuments.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    embedding: vector('embedding', { dimensions: 1536 }).notNull(),
  },
  (table) => ({
    embeddingIndex: index('embedding_index').using('hnsw', table.embedding.op('vector_cosine_ops')),
  }),
);

export const feedback = pgTable(
  'feedback',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull(),
    messageId: uuid('message_id')
      .notNull()
      .references(() => messages.id, { onDelete: 'cascade' }),
    isPositive: boolean('is_positive').notNull(),
    comments: text('comments'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('message_id_idx').on(table.messageId),
    index('is_positive_idx').on(table.isPositive),
    uniqueIndex('user_id_message_id_idx').on(table.userId, table.messageId),
  ],
);

export type Feedback = InferSelectModel<typeof feedback>;
export type NewFeedback = InferInsertModel<typeof feedback>;

// Create Relations
export const reposRelations = relations(repos, ({ many }) => ({
  repoDocuments: many(repoDocuments),
}));

export const repoDocumentsRelations = relations(repoDocuments, ({ one, many }) => ({
  repo: one(repos, {
    fields: [repoDocuments.repoId],
    references: [repos.id],
  }),
  repoDocumentEmbeddings: many(repoDocumentEmbeddings),
}));

export const repoDocumentEmbeddingsRelations = relations(repoDocumentEmbeddings, ({ one }) => ({
  repoDocument: one(repoDocuments, {
    fields: [repoDocumentEmbeddings.documentId],
    references: [repoDocuments.id],
  }),
}));

export const chats = pgTable('chats', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  title: text('title').notNull(),
  userId: text('user_id').notNull(),
});

export type Chat = InferSelectModel<typeof chats>;

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    chatId: uuid('chat_id')
      .notNull()
      .references(() => chats.id, { onDelete: 'cascade' }),
    role: text('role').notNull(),
    content: jsonb('content').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('chat_id_idx').on(table.chatId),
    index('role_idx').on(table.role),
    uniqueIndex('id_chat_id_idx').on(table.id, table.chatId),
  ],
);

export type Message = InferSelectModel<typeof messages>;

// Type inference for TypeScript
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type Repo = InferSelectModel<typeof repos>;
export type NewRepo = InferInsertModel<typeof repos>;
export type RepoDocument = InferSelectModel<typeof repoDocuments>;
export type NewRepoDocument = InferInsertModel<typeof repoDocuments>;
export type RepoDocumentEmbedding = InferSelectModel<typeof repoDocumentEmbeddings>;
export type NewRepoDocumentEmbedding = InferInsertModel<typeof repoDocumentEmbeddings>;
