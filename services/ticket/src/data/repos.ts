import { eq } from 'drizzle-orm';
import { Repo, repos } from '@/db/schema';

export const reposData = {
  /**
   * Get all repos
   */
  async get(db: any): Promise<Repo[]> {
    return db.select().from(repos);
  },

  /**
   * Get a repo by ID
   */
  async getById(db: any, id: number): Promise<Repo | undefined> {
    const results = await db.select().from(repos).where(eq(repos.id, id));
    return results[0];
  },

  /**
   * Get a repo by name
   */
  async getByName(db: any, name: string): Promise<Repo | undefined> {
    const results = await db.select().from(repos).where(eq(repos.name, name));
    return results[0];
  },

  /**
   * Insert a new repo
   */
  async insert(db: any, repo: { id: number; name: string; owner: string; ref: string }): Promise<Repo> {
    const [result] = await db.insert(repos).values(repo).returning();
    return result;
  },

  /**
   * Update a repo
   */
  async update(db: any, repo: { id: number; lastCommitSha?: string }): Promise<void> {
    await db
      .update(repos)
      .set({
        lastCommitSha: repo.lastCommitSha,
        updatedAt: new Date(),
      })
      .where(eq(repos.id, repo.id));
  },
};
