import path from 'path';
import { processAllPdfsInDirectory, saveChunksAsMarkdown } from '@/utils/pdf-processor';
import { syncKnowledgeBase } from '@/workflows/sync-knowledge-base';

/**
 * Process PDFs and sync knowledge base
 */
async function processPdfsAndSyncKnowledgeBase() {
  try {
    console.log('Starting knowledge base sync process...');
    
    // Define paths
    const PDF_DIRECTORY = path.join(process.cwd(), 'src', 'knowledge-base', 'pdfs');
    const OUTPUT_DIRECTORY = path.join(process.cwd(), 'src', 'knowledge-base');
    
    // Categories for organizing content
    const CATEGORIES = {
      'DEP Program Playbook': 'dep-process',
      'Data Steward Job Aid': 'roles',
      'DEP SME Training': 'risk-assessment',
    };
    
    console.log('Processing PDFs from:', PDF_DIRECTORY);
    
    // Process all PDFs in the directory
    const chunks = await processAllPdfsInDirectory(PDF_DIRECTORY);
    
    console.log(`Processed ${chunks.length} chunks from PDFs`);
    
    // Organize chunks by category
    for (const chunk of chunks) {
      const source = path.basename(chunk.metadata.source);
      let category = 'dep-process'; // Default category
      
      // Determine category based on filename
      for (const [keyword, cat] of Object.entries(CATEGORIES)) {
        if (source.includes(keyword)) {
          category = cat;
          break;
        }
      }
      
      // Save chunk to the appropriate category directory
      const categoryDir = path.join(OUTPUT_DIRECTORY, category);
      saveChunksAsMarkdown([chunk], categoryDir);
    }
    
    console.log('Successfully processed PDFs and saved as markdown files');
    
    // Sync knowledge base with vector database
    console.log('Syncing knowledge base with vector database...');
    const result = await syncKnowledgeBase();
    
    console.log('Knowledge base sync completed:', result);
  } catch (error) {
    console.error('Error processing PDFs and syncing knowledge base:', error);
  }
}

// Run the script
processPdfsAndSyncKnowledgeBase();
