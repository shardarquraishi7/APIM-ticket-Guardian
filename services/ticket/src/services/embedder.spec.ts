import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EMBEDDING_MODEL } from '@/constants';
import { ProcessedChunk } from '@/types';
import { EmbedderService } from './embedder';

// Mock the openai module
vi.mock('@/lib/openai', () => ({
  openai: {
    embeddings: {
      create: vi.fn(),
    },
  },
}));

describe('EmbedderService', () => {
  let embedderService: EmbedderService;
  let mockOpenAI: any;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();

    // Create a fresh mock for each test
    mockOpenAI = {
      embeddings: {
        create: vi.fn(),
      },
    };

    embedderService = new EmbedderService(mockOpenAI);
  });

  describe('embed', () => {
    it('should call OpenAI API with correct parameters', async () => {
      // Arrange
      const text = 'Test text to embed';
      const mockEmbedding = [0.1, 0.2, 0.3];
      mockOpenAI.embeddings.create.mockResolvedValueOnce({
        data: [{ embedding: mockEmbedding }],
      });

      // Act
      const result = await embedderService.embed(text);

      // Assert
      expect(mockOpenAI.embeddings.create).toHaveBeenCalledWith({
        model: EMBEDDING_MODEL,
        input: text,
      });
      expect(result).toEqual(mockEmbedding);
    });

    it('should handle API errors properly', async () => {
      // Arrange
      const text = 'Test text to embed';
      const errorMessage = 'API Error';
      mockOpenAI.embeddings.create.mockRejectedValueOnce(new Error(errorMessage));

      // Act & Assert
      await expect(embedderService.embed(text)).rejects.toThrow(errorMessage);
    });
  });

  describe('embedChunks', () => {
    it('should return empty array when no chunks provided', async () => {
      // Act
      const result = await embedderService.embedChunks([]);

      // Assert
      expect(result).toEqual([]);
      expect(mockOpenAI.embeddings.create).not.toHaveBeenCalled();
    });

    it('should embed multiple chunks in a single API call', async () => {
      // Arrange
      const chunks: ProcessedChunk[] = [
        {
          content: 'Chunk 1',
          metadata: {
            source: 'test1',
            owner: 'testOwner',
            repo: 'testRepo',
            path: 'testPath',
            sha: 'testSha',
          },
        },
        {
          content: 'Chunk 2',
          metadata: {
            source: 'test2',
            owner: 'testOwner',
            repo: 'testRepo',
            path: 'testPath',
            sha: 'testSha',
          },
        },
      ];

      const mockEmbeddings = [
        [0.1, 0.2, 0.3],
        [0.4, 0.5, 0.6],
      ];

      mockOpenAI.embeddings.create.mockResolvedValueOnce({
        data: [{ embedding: mockEmbeddings[0] }, { embedding: mockEmbeddings[1] }],
      });

      // Act
      const result = await embedderService.embedChunks(chunks);

      // Assert
      expect(mockOpenAI.embeddings.create).toHaveBeenCalledWith({
        model: EMBEDDING_MODEL,
        input: ['Chunk 1', 'Chunk 2'],
      });

      expect(result).toEqual([
        { ...chunks[0], embedding: mockEmbeddings[0] },
        { ...chunks[1], embedding: mockEmbeddings[1] },
      ]);
    });

    it('should handle API errors when embedding chunks', async () => {
      // Arrange
      const chunks: ProcessedChunk[] = [
        {
          content: 'Chunk 1',
          metadata: {
            source: 'test',
            owner: 'testOwner',
            repo: 'testRepo',
            path: 'testPath',
            sha: 'testSha',
          },
        },
      ];

      const errorMessage = 'API Error';
      mockOpenAI.embeddings.create.mockRejectedValueOnce(new Error(errorMessage));

      // Act & Assert
      await expect(embedderService.embedChunks(chunks)).rejects.toThrow(errorMessage);
    });
  });
});
