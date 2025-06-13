/**
 * Knowledge Base Integration for the Chatbot
 * 
 * This module provides functionality to load, process, and query a knowledge base
 * from a JSON file. It uses vector embeddings to enable semantic search and retrieval
 * of relevant information to answer user questions.
 */

import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

// Initialize the OpenAI client for embeddings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

// Path to the knowledge base JSON file
// In production, this would be stored in a more accessible location
const KB_PATH = process.env.KNOWLEDGE_BASE_PATH || 'C:/Users/t998142/DEP-Automation/chatbot basic/kb_source/improved_runbook_data.json';

// Interface for knowledge base entries
export interface KnowledgeBaseEntry {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  embedding?: number[];
}

// Interface for search results
export interface SearchResult {
  entry: KnowledgeBaseEntry;
  score: number;
}

// In-memory storage for the knowledge base
let knowledgeBase: KnowledgeBaseEntry[] = [];
let isInitialized = false;

/**
 * Loads the knowledge base from the JSON file
 */
export async function loadKnowledgeBase(): Promise<KnowledgeBaseEntry[]> {
  try {
    // Check if the file exists
    if (!fs.existsSync(KB_PATH)) {
      console.error(`Knowledge base file not found at ${KB_PATH}`);
      return [];
    }

    // Read and parse the JSON file
    const data = fs.readFileSync(KB_PATH, 'utf8');
    const jsonData = JSON.parse(data);
    
    // Process the data based on its structure
    // This assumes the JSON has a specific structure - adjust as needed
    const entries: KnowledgeBaseEntry[] = Array.isArray(jsonData) 
      ? jsonData 
      : jsonData.entries || jsonData.data || [];
    
    console.log(`Loaded ${entries.length} entries from knowledge base`);
    return entries;
  } catch (error) {
    console.error('Error loading knowledge base:', error);
    return [];
  }
}

/**
 * Generates embeddings for the knowledge base entries
 */
export async function generateEmbeddings(entries: KnowledgeBaseEntry[]): Promise<KnowledgeBaseEntry[]> {
  const entriesWithEmbeddings: KnowledgeBaseEntry[] = [];
  
  // Process entries in batches to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    
    // Generate embeddings for each entry in the batch
    const batchPromises = batch.map(async (entry) => {
      try {
        // Combine title and content for embedding
        const textToEmbed = `${entry.title}\n${entry.content}`;
        
        // Generate embedding using OpenAI
        const response = await openai.embeddings.create({
          model: 'text-embedding-ada-002',
          input: textToEmbed,
        });
        
        // Add embedding to the entry
        return {
          ...entry,
          embedding: response.data[0].embedding,
        };
      } catch (error) {
        console.error(`Error generating embedding for entry ${entry.id}:`, error);
        return entry;
      }
    });
    
    // Wait for all embeddings in the batch to be generated
    const batchResults = await Promise.all(batchPromises);
    entriesWithEmbeddings.push(...batchResults);
    
    console.log(`Generated embeddings for ${i + batchResults.length}/${entries.length} entries`);
  }
  
  return entriesWithEmbeddings;
}

/**
 * Initializes the knowledge base by loading and generating embeddings
 */
export async function initializeKnowledgeBase(): Promise<boolean> {
  if (isInitialized) {
    return true;
  }
  
  try {
    // Load the knowledge base
    const entries = await loadKnowledgeBase();
    if (entries.length === 0) {
      return false;
    }
    
    // Generate embeddings
    knowledgeBase = await generateEmbeddings(entries);
    isInitialized = true;
    
    console.log('Knowledge base initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing knowledge base:', error);
    return false;
  }
}

/**
 * Calculates the cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) {
    return 0;
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Searches the knowledge base for entries relevant to the query
 */
export async function searchKnowledgeBase(query: string, topK: number = 3): Promise<SearchResult[]> {
  // Initialize the knowledge base if not already done
  if (!isInitialized) {
    const success = await initializeKnowledgeBase();
    if (!success) {
      return [];
    }
  }
  
  try {
    // Generate embedding for the query
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: query,
    });
    
    const queryEmbedding = response.data[0].embedding;
    
    // Calculate similarity scores
    const results: SearchResult[] = knowledgeBase
      .filter(entry => entry.embedding) // Only consider entries with embeddings
      .map(entry => ({
        entry,
        score: cosineSimilarity(queryEmbedding, entry.embedding!),
      }))
      .sort((a, b) => b.score - a.score) // Sort by descending score
      .slice(0, topK); // Take top K results
    
    return results;
  } catch (error) {
    console.error('Error searching knowledge base:', error);
    return [];
  }
}

/**
 * Formats search results into a context string for the AI
 */
export function formatSearchResultsAsContext(results: SearchResult[]): string {
  if (results.length === 0) {
    return '';
  }
  
  return results
    .map((result, index) => {
      const { entry, score } = result;
      return `[${index + 1}] ${entry.title} (Relevance: ${Math.round(score * 100)}%)\n${entry.content}\n`;
    })
    .join('\n---\n\n');
}

/**
 * Gets relevant information from the knowledge base for a query
 */
export async function getRelevantInformation(query: string): Promise<string> {
  const results = await searchKnowledgeBase(query);
  return formatSearchResultsAsContext(results);
}
