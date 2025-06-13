import { eq, inArray } from 'drizzle-orm';
import { repoDocumentEmbeddings } from '@/db/schema';

export const embeddingsData = {
  /**
   * Delete embeddings by document IDs
   */
  async deleteByDocumentIds(db: any, documentIds: string[]): Promise<void> {
    if (documentIds.length === 0) {
      return;
    }
    await db
      .delete(repoDocumentEmbeddings)
      .where(inArray(repoDocumentEmbeddings.documentId, documentIds));
  },

  /**
   * Insert multiple embeddings
   */
  async insertMany(
    db: any,
    embeddings: { documentId: string; content: string; embedding: number[] }[]
  ): Promise<void> {
    if (embeddings.length === 0) {
      return;
    }

    // Insert embeddings in batches to avoid hitting statement size limits
    const BATCH_SIZE = 50;
    for (let i = 0; i < embeddings.length; i += BATCH_SIZE) {
      const batch = embeddings.slice(i, i + BATCH_SIZE);
      await db.insert(repoDocumentEmbeddings).values(batch);
    }
  },
};
