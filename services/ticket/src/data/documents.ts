import { eq, inArray } from 'drizzle-orm';
import { RepoDocument, repoDocuments } from '@/db/schema';

export const documentsData = {
  /**
   * Get a document by ID
   */
  async getById(db: any, id: string): Promise<RepoDocument | undefined> {
    const results = await db.select().from(repoDocuments).where(eq(repoDocuments.id, id));
    return results[0];
  },

  /**
   * Get documents by repo ID
   */
  async getByRepoId(db: any, repoId: number): Promise<RepoDocument[]> {
    return db.select().from(repoDocuments).where(eq(repoDocuments.repoId, repoId));
  },

  /**
   * Get documents by repo ID and paths
   */
  async getRepoDocumentsByRepoIdAndPaths(
    db: any,
    repoId: number,
    paths: string[]
  ): Promise<RepoDocument[]> {
    if (paths.length === 0) {
      return [];
    }
    return db
      .select()
      .from(repoDocuments)
      .where(eq(repoDocuments.repoId, repoId))
      .where(inArray(repoDocuments.path, paths));
  },

  /**
   * Delete documents by repo ID and paths
   */
  async deleteByRepoIdAndPaths(db: any, repoId: number, paths: string[]): Promise<void> {
    if (paths.length === 0) {
      return;
    }
    await db
      .delete(repoDocuments)
      .where(eq(repoDocuments.repoId, repoId))
      .where(inArray(repoDocuments.path, paths));
  },

  /**
   * Delete documents by repo ID
   */
  async deleteByRepoId(db: any, repoId: number): Promise<void> {
    await db.delete(repoDocuments).where(eq(repoDocuments.repoId, repoId));
  },

  /**
   * Upsert multiple documents
   */
  async upsertMany(
    db: any,
    documents: { repoId: number; path: string; content: string; sha: string }[]
  ): Promise<{ id: string; path: string }[]> {
    if (documents.length === 0) {
      return [];
    }

    const results = [];

    for (const doc of documents) {
      // Check if the document already exists
      const existingDocs = await db
        .select()
        .from(repoDocuments)
        .where(eq(repoDocuments.repoId, doc.repoId))
        .where(eq(repoDocuments.path, doc.path));

      let id;

      if (existingDocs.length > 0) {
        // Update existing document
        const existingDoc = existingDocs[0];
        await db
          .update(repoDocuments)
          .set({
            content: doc.content,
            sha: doc.sha,
            updatedAt: new Date(),
          })
          .where(eq(repoDocuments.id, existingDoc.id));
        id = existingDoc.id;
      } else {
        // Insert new document
        const [inserted] = await db.insert(repoDocuments).values({
          repoId: doc.repoId,
          path: doc.path,
          content: doc.content,
          sha: doc.sha,
        }).returning({ id: repoDocuments.id });
        id = inserted.id;
      }

      results.push({
        id,
        path: doc.path,
      });
    }

    return results;
  },

  /**
   * Match embedding to find similar documents
   */
  async matchEmbedding(db: any, embedding: number[], limit: number = 5): Promise<string[]> {
    // This query uses pgvector's cosine similarity to find similar documents
    const result = await db.execute(`
      SELECT rd.content, 1 - (rde.embedding <=> $1) as similarity
      FROM repo_document_embeddings rde
      JOIN repo_documents rd ON rd.id = rde.document_id
      ORDER BY rde.embedding <=> $1
      LIMIT $2
    `, [embedding, limit]);

    return result.rows.map((row: any) => row.content);
  },
};
