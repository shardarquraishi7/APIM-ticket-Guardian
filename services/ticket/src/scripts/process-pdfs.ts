import fs from 'fs';
import path from 'path';
import { processPdfFile, saveChunksAsMarkdown } from '@/utils/pdf-processor';

// Define paths
const PDF_DIRECTORY = path.join(process.cwd(), 'src', 'knowledge-base', 'pdfs');
const OUTPUT_DIRECTORY = path.join(process.cwd(), 'src', 'knowledge-base');

// Categories for organizing content
const CATEGORIES = {
  'DEP Program Playbook': 'dep-process',
  'Data Steward Job Aid': 'roles',
  'DEP SME Training': 'risk-assessment',
};

/**
 * Process PDFs and save as markdown files
 */
async function processPdfs() {
  try {
    console.log('Processing PDFs from:', PDF_DIRECTORY);
    
    // Get all PDF files in the directory
    const files = fs.readdirSync(PDF_DIRECTORY)
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .map(file => path.join(PDF_DIRECTORY, file));
    
    console.log(`Found ${files.length} PDF files`);
    
    // Process each PDF file individually to reduce memory usage
    let totalChunks = 0;
    
    for (const file of files) {
      console.log(`Processing ${path.basename(file)}...`);
      
      // Process the PDF file
      const chunks = await processPdfFile(file);
      
      console.log(`  Created ${chunks.length} chunks`);
      totalChunks += chunks.length;
      
      // Determine category based on filename
      const fileName = path.basename(file);
      let category = 'dep-process'; // Default category
      
      for (const [keyword, cat] of Object.entries(CATEGORIES)) {
        if (fileName.includes(keyword)) {
          category = cat;
          break;
        }
      }
      
      // Save chunks to the appropriate category directory
      const categoryDir = path.join(OUTPUT_DIRECTORY, category);
      saveChunksAsMarkdown(chunks, categoryDir);
      
      console.log(`  Saved chunks to ${category} directory`);
    }
    
    console.log(`Successfully processed ${files.length} PDFs with ${totalChunks} total chunks`);
  } catch (error) {
    console.error('Error processing PDFs:', error);
  }
}

// Run the script
processPdfs();
