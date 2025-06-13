import { documentsData } from '@/data/documents';
import { embeddingsData } from '@/data/embeddings';
import { reposData } from '@/data/repos';
import { createDb } from '@/db';
import { createLogger } from '@/lib/logger';
import { embedderService } from '@/services/embedder';
import { fileProcessingService } from '@/services/file-processing';
import { githubService } from '@/services/github';
import { githubFileChangeTracker } from '@/services/github-file-tracker';
import { EmbeddedChunk } from '@/types/chunk';
import { FileData } from '@/types/file';

const logger = createLogger('sync-github-repos');

interface UpsertedDocs {
  id: string;
  path: string;
}

export async function syncGithubRepos() {
  logger.info('Syncing github repos');
  const results = [];
  const db = await createDb();

  const repos = await reposData.get(db);
  logger.trace('Fetched Repos');

  for (const repo of repos) {
    const { added, modified, deleted, latestCommit } =
      await githubFileChangeTracker.getChangesSinceCommit(repo);
    logger.trace(`Fetched Changes for ${repo.name}`);

    const files = await githubService.fetchMarkdownFiles({
      owner: repo.owner,
      repo: repo.name,
      ref: repo.ref,
      filesToProcess: [...added, ...modified],
    });
    logger.trace(`Fetched Files for ${repo.name} with ${files.length} files`);

    const processedFiles = await fileProcessingService.processFiles(files);
    logger.trace(`Processed Files for ${repo.name} with ${processedFiles.length} files`);

    const embeddedChunks = await embedderService.embedChunks(processedFiles);
    logger.trace(`Embedded Chunks for ${repo.name} with ${embeddedChunks.length} chunks`);

    await db.transaction(async (tx) => {
      // Delete files that are no longer in the repo
      await documentsData.deleteByRepoIdAndPaths(tx, repo.id, deleted);
      if (deleted.length > 0) {
        logger.trace(`Deleted Files for ${repo.name}`);
      }

      // Delete chunks for files that were modified
      const docsToDelete = await documentsData.getRepoDocumentsByRepoIdAndPaths(
        tx,
        repo.id,
        modified,
      );
      const docIdsToDelete = docsToDelete.map((doc) => doc.id);
      await embeddingsData.deleteByDocumentIds(tx, docIdsToDelete);
      if (docIdsToDelete.length > 0) {
        logger.trace(`Deleted Chunks for ${repo.name}`);
      }

      // Upsert new and modified documents
      const upsertedDocs = await documentsData.upsertMany(
        tx,
        getDocumentInsertions(repo.id, files),
      );
      if (files.length > 0) {
        logger.trace(`Upserted Docs for ${repo.name}`);
      }

      // Insert mapped embeddings for new and modified documents
      await embeddingsData.insertMany(tx, getEmbeddingInserts(embeddedChunks, upsertedDocs));
      if (upsertedDocs.length > 0) {
        logger.trace(`Inserted Embeddings for ${repo.name}`);
      }

      // Update repo last commit sha for next sync
      await reposData.update(tx, {
        id: repo.id,
        lastCommitSha: latestCommit,
      });
      logger.trace({ sha: latestCommit }, `Updated last commit sha for ${repo.name}`);
    });

    results.push({
      repoId: repo.id,
      repoName: repo.name,
      latestCommitSha: latestCommit,
      added,
      modified,
      deleted,
    });

    logger.info(`Synced repository ${repo.name}`);
  }

  return results;
}

export function getDocumentInsertions(repoId: number, files: FileData[]) {
  return files.map((file) => ({
    repoId,
    path: file.metadata.path,
    content: file.content,
    sha: file.metadata.sha,
  }));
}

export function getEmbeddingInserts(embeddedChunks: EmbeddedChunk[], upsertedDocs: UpsertedDocs[]) {
  const docIdMap = new Map<string, string>();

  for (const doc of upsertedDocs) {
    docIdMap.set(doc.path, doc.id);
  }

  return embeddedChunks.map((chunk) => {
    const documentId = docIdMap.get(chunk.metadata.path);
    if (!documentId) {
      throw new Error(`Document not found for chunk ${chunk.metadata.path}`);
    }
    return {
      documentId,
      content: chunk.content,
      embedding: chunk.embedding,
    };
  });
}

export function dedupeByRepoPath(docs: { repoId: number; path: string }[]) {
  const seen = new Map<string, (typeof docs)[0]>();
  for (const doc of docs) {
    const key = `${doc.repoId}:${doc.path}`;
    seen.set(key, doc);
  }
  return Array.from(seen.values());
}
