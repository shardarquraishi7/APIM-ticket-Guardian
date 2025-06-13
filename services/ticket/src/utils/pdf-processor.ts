import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { ProcessedChunk } from '@/types/chunk';

// Define the chunk size (in characters)
const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 100;

/**
 * Process a PDF file and extract text chunks
 * @param filePath Path to the PDF file
 * @returns Array of processed chunks
 */
export async function processPdfFile(filePath: string): Promise<ProcessedChunk[]> {
  try {
    // Read the PDF file
    const dataBuffer = fs.readFileSync(filePath);
    
    // Parse the PDF
    const pdfData = await pdfParse(dataBuffer);
    
    // Get the text content
    const text = pdfData.text;
    
    // Split the text into chunks
    const chunks = splitTextIntoChunks(text, CHUNK_SIZE, CHUNK_OVERLAP);
    
    // Get the file name without extension
    const fileName = path.basename(filePath, path.extname(filePath));
    
    // Create processed chunks
    return chunks.map((chunk, index) => ({
      content: chunk,
      metadata: {
        path: `${fileName}-chunk-${index + 1}`,
        source: filePath,
        chunkIndex: index,
      },
    }));
  } catch (error) {
    console.error(`Error processing PDF file ${filePath}:`, error);
    throw error;
  }
}

/**
 * Split text into overlapping chunks
 * @param text Text to split
 * @param chunkSize Size of each chunk
 * @param overlap Overlap between chunks
 * @returns Array of text chunks
 */
function splitTextIntoChunks(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  let startIndex = 0;
  
  while (startIndex < text.length) {
    // Calculate end index for this chunk
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    
    // Extract the chunk
    const chunk = text.substring(startIndex, endIndex);
    
    // Add the chunk to the array
    chunks.push(chunk);
    
    // Move the start index for the next chunk
    startIndex = endIndex - overlap;
    
    // If we've reached the end of the text, break
    if (startIndex >= text.length) {
      break;
    }
  }
  
  return chunks;
}

/**
 * Process all PDF files in a directory
 * @param directoryPath Path to the directory containing PDF files
 * @returns Array of processed chunks from all PDFs
 */
export async function processAllPdfsInDirectory(directoryPath: string): Promise<ProcessedChunk[]> {
  try {
    // Get all PDF files in the directory
    const files = fs.readdirSync(directoryPath)
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .map(file => path.join(directoryPath, file));
    
    // Process each PDF file
    const chunksPromises = files.map(file => processPdfFile(file));
    
    // Wait for all PDFs to be processed
    const chunkArrays = await Promise.all(chunksPromises);
    
    // Flatten the array of arrays into a single array
    return chunkArrays.flat();
  } catch (error) {
    console.error(`Error processing PDFs in directory ${directoryPath}:`, error);
    throw error;
  }
}

/**
 * Save processed chunks as markdown files
 * @param chunks Array of processed chunks
 * @param outputDirectory Directory to save markdown files
 */
export function saveChunksAsMarkdown(chunks: ProcessedChunk[], outputDirectory: string): void {
  try {
    // Create the output directory if it doesn't exist
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true });
    }
    
    // Save each chunk as a markdown file
    chunks.forEach((chunk, index) => {
      const fileName = `${chunk.metadata.path}.md`;
      const filePath = path.join(outputDirectory, fileName);
      
      // Create markdown content with metadata
      const markdownContent = `---
source: ${chunk.metadata.source}
chunkIndex: ${chunk.metadata.chunkIndex}
---

${chunk.content}`;
      
      // Write the file
      fs.writeFileSync(filePath, markdownContent);
    });
  } catch (error) {
    console.error(`Error saving chunks as markdown:`, error);
    throw error;
  }
}
