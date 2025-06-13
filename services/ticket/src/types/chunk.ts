/**
 * Represents a processed chunk of text with metadata
 */
export interface ProcessedChunk {
  content: string;
  metadata: {
    path: string;
    source: string;
    chunkIndex?: number;
    [key: string]: any;
  };
}

/**
 * Represents a processed chunk with an embedding vector
 */
export interface EmbeddedChunk extends ProcessedChunk {
  embedding: number[];
}
