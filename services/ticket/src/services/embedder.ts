import OpenAI from 'openai';
import { EMBEDDING_MODEL } from '@/constants';
import { openai } from '@/lib/openai';
import { EmbeddedChunk, ProcessedChunk } from '@/types';

export class EmbedderService {
  private openai: OpenAI;

  constructor(openai: OpenAI) {
    this.openai = openai;
  }

  async embed(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
    });

    return response.data[0].embedding;
  }

  async embedChunks(chunks: ProcessedChunk[]): Promise<EmbeddedChunk[]> {
    if (chunks.length === 0) {
      return [];
    }

    // Extract all content from chunks
    const texts = chunks.map((chunk) => chunk.content);

    // Get embeddings for all texts in a single API call
    const response = await this.openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: texts,
    });

    // Map the embeddings back to their corresponding chunks
    return chunks.map((chunk, index) => ({
      ...chunk,
      embedding: response.data[index].embedding,
    }));
  }
}

export const embedderService = new EmbedderService(openai);
