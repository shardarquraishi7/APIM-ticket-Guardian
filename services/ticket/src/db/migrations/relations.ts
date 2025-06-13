import { relations } from 'drizzle-orm/relations';
import { chats, messages, repoDocumentEmbeddings, repoDocuments, repos } from './schema';

export const repoDocumentsRelations = relations(repoDocuments, ({ one, many }) => ({
  repo: one(repos, {
    fields: [repoDocuments.repoId],
    references: [repos.id],
  }),
  repoDocumentEmbeddings: many(repoDocumentEmbeddings),
}));

export const reposRelations = relations(repos, ({ many }) => ({
  repoDocuments: many(repoDocuments),
}));

export const repoDocumentEmbeddingsRelations = relations(repoDocumentEmbeddings, ({ one }) => ({
  repoDocument: one(repoDocuments, {
    fields: [repoDocumentEmbeddings.documentId],
    references: [repoDocuments.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
}));

export const chatsRelations = relations(chats, ({ many }) => ({
  messages: many(messages),
}));
