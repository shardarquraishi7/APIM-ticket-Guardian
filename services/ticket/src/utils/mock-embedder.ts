import { EmbeddedChunk, ProcessedChunk } from '@/types/chunk';
import { createLogger } from '@/lib/logger';

const logger = createLogger('mock-embedder');

/**
 * A mock embedder service that generates random embeddings
 * for testing purposes when a real OpenAI API key is not available.
 */
export class MockEmbedderService {
  /**
   * Generate a random embedding vector of the specified dimension
   */
  private generateRandomEmbedding(dimensions: number = 1536): number[] {
    const embedding: number[] = [];
    for (let i = 0; i < dimensions; i++) {
      // Generate a random number between -1 and 1
      embedding.push(Math.random() * 2 - 1);
    }
    return embedding;
  }

  /**
   * Generate a mock embedding for a single text
   */
  async embed(text: string): Promise<number[]> {
    logger.info('Generating mock embedding for text');
    return this.generateRandomEmbedding();
  }

  /**
   * Generate mock embeddings for multiple chunks
   */
  async embedChunks(chunks: ProcessedChunk[]): Promise<EmbeddedChunk[]> {
    if (chunks.length === 0) {
      return [];
    }

    logger.info(`Generating mock embeddings for ${chunks.length} chunks`);
    
    // Generate random embeddings for each chunk
    return chunks.map((chunk) => ({
      ...chunk,
      embedding: this.generateRandomEmbedding(),
    }));
  }
}

// Export a singleton instance
export const mockEmbedderService = new MockEmbedderService();
