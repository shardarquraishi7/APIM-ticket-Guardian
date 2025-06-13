import { sql } from 'drizzle-orm';
import {
  boolean,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  vector,
} from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: serial().primaryKey().notNull(),
    name: text().notNull(),
    email: text().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [unique('users_email_unique').on(table.email)],
);

export const repoDocuments = pgTable(
  'repo_documents',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    repoId: integer('repo_id').notNull(),
    content: text().notNull(),
    sha: text().notNull(),
    path: text().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('repo_id_path_idx').using(
      'btree',
      table.repoId.asc().nullsLast().op('int4_ops'),
      table.path.asc().nullsLast().op('int4_ops'),
    ),
    foreignKey({
      columns: [table.repoId],
      foreignColumns: [repos.id],
      name: 'repo_documents_repo_id_repos_id_fk',
    }).onDelete('cascade'),
  ],
);

export const repoDocumentEmbeddings = pgTable(
  'repo_document_embeddings',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    documentId: uuid('document_id').notNull(),
    content: text().notNull(),
    embedding: vector({ dimensions: 1536 }).notNull(),
  },
  (table) => [
    index('embedding_index').using(
      'hnsw',
      table.embedding.asc().nullsLast().op('vector_cosine_ops'),
    ),
    foreignKey({
      columns: [table.documentId],
      foreignColumns: [repoDocuments.id],
      name: 'repo_document_embeddings_document_id_repo_documents_id_fk',
    }).onDelete('cascade'),
  ],
);

export const repos = pgTable(
  'repos',
  {
    id: serial().primaryKey().notNull(),
    name: text().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [unique('repos_name_unique').on(table.name)],
);

export const chatFeedback = pgTable('chat_feedback', {
  id: serial().primaryKey().notNull(),
  messages: jsonb().notNull(),
  isPositive: boolean('is_positive').notNull(),
  comments: text(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
});

export const chats = pgTable('chats', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  createdAt: timestamp({ mode: 'string' }).notNull(),
  title: text().notNull(),
  userId: text().notNull(),
});

export const messages = pgTable(
  'messages',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    chatId: uuid().notNull(),
    role: text().notNull(),
    content: jsonb().notNull(),
    createdAt: timestamp({ mode: 'string' }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.chatId],
      foreignColumns: [chats.id],
      name: 'messages_chatId_chats_id_fk',
    }).onDelete('cascade'),
  ],
);

export const drizzleMigrations = pgTable(
  'drizzle_migrations',
  {
    id: serial().primaryKey().notNull(),
    hash: text().notNull(),
    migrationName: text('migration_name').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [unique('drizzle_migrations_migration_name_key').on(table.migrationName)],
);
