import fs from 'fs';
import path from 'path';
import { documentsData } from '@/data/documents';
import { embeddingsData } from '@/data/embeddings';
import { reposData } from '@/data/repos';
import { createDb } from '@/db';
import { createLogger } from '@/lib/logger';
import { embedderService } from '@/services/embedder';
import { ProcessedChunk } from '@/types/chunk';

const logger = createLogger('sync-knowledge-base');

// Define a special repo ID for the knowledge base
const KNOWLEDGE_BASE_REPO_ID = 999;
const KNOWLEDGE_BASE_REPO_NAME = 'dep-knowledge-base';

interface KnowledgeBaseFile {
  path: string;
  content: string;
}

/**
 * Sync the knowledge base with the vector database
 */
export async function syncKnowledgeBase() {
  logger.info('Syncing knowledge base');
  const db = await createDb();

  try {
    // Ensure the knowledge base repo exists in the database
    await ensureKnowledgeBaseRepo(db);

    // Get all markdown files from the knowledge base
    const files = getAllMarkdownFiles();
    logger.trace(`Found ${files.length} markdown files in knowledge base`);

    // Process the files into chunks
    const processedChunks = processMarkdownFiles(files);
    logger.trace(`Processed ${processedChunks.length} chunks from knowledge base`);

    // Create embeddings for the chunks
    const embeddedChunks = await embedderService.embedChunks(processedChunks);
    logger.trace(`Created embeddings for ${embeddedChunks.length} chunks`);

    // Store the embeddings in the database
    await db.transaction(async (tx) => {
      // Delete existing knowledge base documents and embeddings
      const existingDocs = await documentsData.getByRepoId(tx, KNOWLEDGE_BASE_REPO_ID);
      const docIdsToDelete = existingDocs.map((doc) => doc.id);
      await embeddingsData.deleteByDocumentIds(tx, docIdsToDelete);
      await documentsData.deleteByRepoId(tx, KNOWLEDGE_BASE_REPO_ID);
      logger.trace('Deleted existing knowledge base documents and embeddings');

      // Insert new documents
      const upsertedDocs = await documentsData.upsertMany(
        tx,
        files.map((file) => ({
          repoId: KNOWLEDGE_BASE_REPO_ID,
          path: file.path,
          content: file.content,
          sha: '', // Not needed for knowledge base
        }))
      );
      logger.trace(`Inserted ${upsertedDocs.length} knowledge base documents`);

      // Create a map of file paths to document IDs
      const docIdMap = new Map<string, string>();
      for (const doc of upsertedDocs) {
        docIdMap.set(doc.path, doc.id);
      }

      // Insert embeddings
      const embeddingInserts = embeddedChunks.map((chunk) => {
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

      await embeddingsData.insertMany(tx, embeddingInserts);
      logger.trace(`Inserted ${embeddingInserts.length} embeddings`);
    });

    logger.info('Knowledge base sync completed successfully');
    return { success: true, chunksProcessed: embeddedChunks.length };
  } catch (error) {
    logger.error('Error syncing knowledge base:', error);
    throw error;
  }
}

/**
 * Ensure the knowledge base repo exists in the database
 */
async function ensureKnowledgeBaseRepo(db: any) {
  try {
    // Check if the repo already exists
    const existingRepo = await reposData.getByName(db, KNOWLEDGE_BASE_REPO_NAME);
    
    if (!existingRepo) {
      // Create the repo if it doesn't exist
      await reposData.insert(db, {
        id: KNOWLEDGE_BASE_REPO_ID,
        name: KNOWLEDGE_BASE_REPO_NAME,
        owner: 'local',
        ref: 'main',
      });
      logger.info('Created knowledge base repo in database');
    }
  } catch (error) {
    logger.error('Error ensuring knowledge base repo exists:', error);
    throw error;
  }
}

/**
 * Get all markdown files from the knowledge base
 */
function getAllMarkdownFiles(): KnowledgeBaseFile[] {
  const knowledgeBaseDir = path.join(process.cwd(), 'src', 'knowledge-base');
  const files: KnowledgeBaseFile[] = [];

  // Function to recursively get all markdown files
  function getFilesRecursively(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip the pdfs directory
        if (entry.name !== 'pdfs') {
          getFilesRecursively(fullPath);
        }
      } else if (entry.name.endsWith('.md')) {
        // Read the file content
        const content = fs.readFileSync(fullPath, 'utf-8');
        
        // Get the relative path from the knowledge base directory
        const relativePath = path.relative(knowledgeBaseDir, fullPath);
        
        files.push({
          path: relativePath,
          content,
        });
      }
    }
  }

  getFilesRecursively(knowledgeBaseDir);
  return files;
}

/**
 * Process markdown files into chunks
 */
function processMarkdownFiles(files: KnowledgeBaseFile[]): ProcessedChunk[] {
  const chunks: ProcessedChunk[] = [];

  for (const file of files) {
    // Each file is already a chunk from the PDF processing
    chunks.push({
      content: file.content,
      metadata: {
        path: file.path,
        source: file.path,
        chunkIndex: 0,
      },
    });
  }

  return chunks;
}
