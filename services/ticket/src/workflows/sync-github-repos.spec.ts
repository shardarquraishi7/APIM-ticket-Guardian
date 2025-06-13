import { describe, expect, it, vi } from 'vitest';
import { documentsData } from '@/data/documents';
import { reposData } from '@/data/repos';
import { createDb } from '@/db';
import { embedderService } from '@/services/embedder';
import { fileProcessingService } from '@/services/file-processing';
import { githubService } from '@/services/github';
import { githubFileChangeTracker } from '@/services/github-file-tracker';
import { EmbeddedChunk } from '@/types/chunk';
import { FileData } from '@/types/file';
import {
  dedupeByRepoPath,
  getDocumentInsertions,
  getEmbeddingInserts,
  syncGithubRepos,
} from './sync-github-repos';

// Mock all dependencies
vi.mock('@/data/documents', () => ({
  documentsData: {
    deleteByRepoIdAndPaths: vi.fn(),
    getRepoDocumentsByRepoIdAndPaths: vi.fn(),
    upsertMany: vi.fn(),
  },
}));

vi.mock('@/data/embeddings', () => ({
  embeddingsData: {
    deleteByDocumentIds: vi.fn(),
    insertMany: vi.fn(),
  },
}));

vi.mock('@/data/repos', () => ({
  reposData: {
    get: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/db', () => ({
  createDb: vi.fn(),
}));

vi.mock('@/services/embedder', () => ({
  embedderService: {
    embedChunks: vi.fn(),
  },
}));

vi.mock('@/services/file-processing', () => ({
  fileProcessingService: {
    processFiles: vi.fn(),
  },
}));

vi.mock('@/services/github', () => ({
  githubService: {
    fetchMarkdownFiles: vi.fn(),
  },
}));

vi.mock('@/services/github-file-tracker', () => ({
  githubFileChangeTracker: {
    getChangesSinceCommit: vi.fn(),
  },
}));

describe('syncGithubRepos', () => {
  // Simplified test that doesn't rely on complex mocking
  it('should call the necessary functions', async () => {
    // Setup mocks
    const mockDb = {
      transaction: vi.fn((callback) => callback(mockDb)),
    };

    const mockRepo = {
      id: 1,
      owner: 'testOwner',
      name: 'testRepo',
      ref: 'main',
      lastCommitSha: 'oldsha123',
    };

    const mockChangeData = {
      added: ['docs/file1.md'],
      modified: ['docs/file2.md'],
      deleted: ['docs/old.md'],
      latestCommit: 'newsha456',
    };

    const mockFiles = [
      { content: 'content1', metadata: { path: 'docs/file1.md', sha: 'sha1' } },
      { content: 'content2', metadata: { path: 'docs/file2.md', sha: 'sha2' } },
    ];

    const mockEmbeddedChunks = [
      { content: 'chunk1', embedding: [0.1], metadata: { path: 'docs/file1.md' } },
      { content: 'chunk2', embedding: [0.2], metadata: { path: 'docs/file2.md' } },
    ];

    const mockUpsertedDocs = [
      { id: 'doc1', path: 'docs/file1.md' },
      { id: 'doc2', path: 'docs/file2.md' },
    ];

    // Setup mock implementations
    vi.mocked(createDb).mockResolvedValue(mockDb as any);
    vi.mocked(reposData.get).mockResolvedValue([mockRepo] as any);
    vi.mocked(githubFileChangeTracker.getChangesSinceCommit).mockResolvedValue(mockChangeData);
    vi.mocked(githubService.fetchMarkdownFiles).mockResolvedValue(mockFiles as any);
    vi.mocked(fileProcessingService.processFiles).mockResolvedValue(mockFiles as any);
    vi.mocked(embedderService.embedChunks).mockResolvedValue(mockEmbeddedChunks as any);
    vi.mocked(documentsData.getRepoDocumentsByRepoIdAndPaths).mockResolvedValue([
      { id: 'oldDoc1' },
    ] as any);
    vi.mocked(documentsData.upsertMany).mockResolvedValue(mockUpsertedDocs as any);

    // Execute the function
    await syncGithubRepos();

    // Verify basic function calls
    expect(createDb).toHaveBeenCalled();
    expect(reposData.get).toHaveBeenCalled();
    expect(githubFileChangeTracker.getChangesSinceCommit).toHaveBeenCalled();
    expect(githubService.fetchMarkdownFiles).toHaveBeenCalled();
    expect(fileProcessingService.processFiles).toHaveBeenCalled();
    expect(embedderService.embedChunks).toHaveBeenCalled();
    expect(mockDb.transaction).toHaveBeenCalled();
  });
});

describe('getDocumentInsertions', () => {
  it('should map files to document insertions correctly', () => {
    const repoId = 1;
    const files: FileData[] = [
      {
        content: 'Content 1',
        metadata: {
          path: 'path/to/file1.md',
          sha: 'sha1',
          owner: 'testOwner',
          repo: 'testRepo',
          name: 'file1.md',
        },
      },
      {
        content: 'Content 2',
        metadata: {
          path: 'path/to/file2.md',
          sha: 'sha2',
          owner: 'testOwner',
          repo: 'testRepo',
          name: 'file2.md',
        },
      },
    ];

    const result = getDocumentInsertions(repoId, files);

    expect(result).toEqual([
      {
        repoId: 1,
        path: 'path/to/file1.md',
        content: 'Content 1',
        sha: 'sha1',
      },
      {
        repoId: 1,
        path: 'path/to/file2.md',
        content: 'Content 2',
        sha: 'sha2',
      },
    ]);
  });
});

describe('getEmbeddingInserts', () => {
  it('should map embedded chunks to embedding inserts correctly', () => {
    const embeddedChunks: EmbeddedChunk[] = [
      {
        content: 'Chunk 1',
        embedding: [0.1, 0.2],
        metadata: {
          path: 'path/to/file1.md',
          owner: 'testOwner',
          repo: 'testRepo',
          name: 'file1.md',
          sha: 'sha1',
        },
      },
      {
        content: 'Chunk 2',
        embedding: [0.3, 0.4],
        metadata: {
          path: 'path/to/file2.md',
          owner: 'testOwner',
          repo: 'testRepo',
          name: 'file2.md',
          sha: 'sha2',
        },
      },
    ];

    const upsertedDocs = [
      { id: 'doc1', path: 'path/to/file1.md' },
      { id: 'doc2', path: 'path/to/file2.md' },
    ];

    const result = getEmbeddingInserts(embeddedChunks, upsertedDocs);

    expect(result).toEqual([
      {
        documentId: 'doc1',
        content: 'Chunk 1',
        embedding: [0.1, 0.2],
      },
      {
        documentId: 'doc2',
        content: 'Chunk 2',
        embedding: [0.3, 0.4],
      },
    ]);
  });

  it('should throw an error if document not found for a chunk', () => {
    const embeddedChunks: EmbeddedChunk[] = [
      {
        content: 'Chunk 1',
        embedding: [0.1, 0.2],
        metadata: {
          path: 'path/to/file1.md',
          owner: 'testOwner',
          repo: 'testRepo',
          name: 'file1.md',
          sha: 'sha1',
        },
      },
    ];

    const upsertedDocs = [{ id: 'doc2', path: 'path/to/file2.md' }];

    expect(() => getEmbeddingInserts(embeddedChunks, upsertedDocs)).toThrow(
      'Document not found for chunk path/to/file1.md',
    );
  });
});

describe('dedupeByRepoPath', () => {
  it('should deduplicate documents by repo and path', () => {
    const docs = [
      { repoId: 1, path: 'file1.md', content: 'content1' },
      { repoId: 1, path: 'file1.md', content: 'content2' }, // Duplicate
      { repoId: 1, path: 'file2.md', content: 'content3' },
      { repoId: 2, path: 'file1.md', content: 'content4' }, // Different repo
    ];

    const result = dedupeByRepoPath(docs);

    // Should keep the last occurrence of each unique repoId:path combination
    expect(result).toHaveLength(3);
    expect(result).toContainEqual({ repoId: 1, path: 'file1.md', content: 'content2' });
    expect(result).toContainEqual({ repoId: 1, path: 'file2.md', content: 'content3' });
    expect(result).toContainEqual({ repoId: 2, path: 'file1.md', content: 'content4' });
  });

  it('should handle empty array', () => {
    const result = dedupeByRepoPath([]);
    expect(result).toEqual([]);
  });
});
