// This file should only be imported in server components or API routes
// as it uses Node.js modules like 'fs' and 'path'

import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@/lib/logger';
import { Section } from '@/types';
import { getSectionFromId } from '@/services/section-service';

const logger = createLogger('xlsx-service');

// Define the uploads directory path
const UPLOADS_DIR = path.join(process.cwd(), 'src', 'uploads');

// Column indices (adjust as needed for your template)
const HDR_ROW = 8;       // row number where headers live
const DATA_START = 9;    // first data row (HDR_ROW + 1)
const C_ID = 1;          // "Question ID" column (A)
const C_DESCRIPTION = 2; // "Description" or full prompt (B)
const C_UNIQUE = 3;      // "Unique ID" column (C), if used
const C_ANSWER = 5;      // "Response/Answer" column (E)

// Ensure the uploads directory exists
if (typeof window === 'undefined' && !fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Interface for question data
export interface QuestionData {
  id: string;
  question: string;
  answer?: string;
  options?: string[];
  confidence?: number;
  uniqueId?: string; // Unique identifier from the Excel file
  metadata?: {
    merged?: boolean;
    skipped?: boolean;
    [key: string]: any;
  };
}

// Interface for the DEP file structure
export interface DEPFileStructure {
  questions: QuestionData[];
  answerOptions: Record<string, string[]>;
  metadata: Record<string, any>;
  preExistingAnswers: number; // Count of questions that already have answers
  sectionCounts?: Record<string, number>; // Count of questions by section
}


/**
 * Helper function to find column index by header text
 * @param sheet - The worksheet to search
 * @param headerText - The header text to find
 * @returns The column index
 */
function findColumnIndexByHeader(sheet: ExcelJS.Worksheet, headerText: string): number {
  const headerRow = sheet.getRow(HDR_ROW);
  for (let i = 1; i <= headerRow.cellCount; i++) {
    if (headerRow.getCell(i).text.trim().toLowerCase() === headerText.toLowerCase()) {
      return i;
    }
  }
  // If not found, return default values
  if (headerText.toLowerCase().includes('question')) return C_ID;
  if (headerText.toLowerCase().includes('unique')) return C_UNIQUE;
  if (headerText.toLowerCase().includes('response') || headerText.toLowerCase().includes('answer')) return C_ANSWER;
  
  logger.warn(`Header "${headerText}" not found in row ${HDR_ROW}, using default column index`);
  return -1;
}

/**
 * Service for handling XLSX file operations
 */
export class XlsxService {
  /**
   * Load a workbook with proper error handling
   * @param filePath - Path to the XLSX file
   * @returns The loaded workbook
   */
  async loadWorkbook(filePath: string): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.readFile(filePath);
      return workbook;
    } catch (err: any) {
      throw new Error(`Failed to load XLSX at ${filePath}: ${err.message}`);
    }
  }
  /**
   * Parse the "Assessment Response Options" sheet to get allowed options for each question
   * @param workbook - The loaded Excel workbook
   * @returns Record mapping question IDs to their allowed options
   */
  async parseAnswerOptions(workbook: ExcelJS.Workbook): Promise<Record<string, string[]>> {
    try {
      // Find the Assessment Response Options sheet (typically sheet 3)
      const optionsSheet = workbook.getWorksheet('Assessment Response Options') || 
                          workbook.getWorksheet(3);
      
      if (!optionsSheet) {
        logger.warn('Assessment Response Options sheet not found');
        return {};
      }
      
      const allowedOptions: Record<string, string[]> = {};
      
      // Process the header row to find question IDs
      const headerRow = optionsSheet.getRow(1);
      const questionIds: string[] = [];
      
      // Map column indices to question IDs
      for (let col = 1; col <= headerRow.cellCount; col++) {
        const cellValue = headerRow.getCell(col).text.trim();
        if (cellValue && cellValue !== 'Question ID' && cellValue !== 'Option') {
          questionIds[col] = cellValue;
        }
      }
      
      // Process each row starting from row 2
      for (let rowNumber = 2; rowNumber <= optionsSheet.rowCount; rowNumber++) {
        const row = optionsSheet.getRow(rowNumber);
        
        // Skip empty rows
        if (row.cellCount === 0) continue;
        
        // Process each cell in the row
        for (let col = 1; col <= row.cellCount; col++) {
          const questionId = questionIds[col];
          if (!questionId) continue;
          
          const cellValue = this.getCellValueAsString(row.getCell(col));
          if (cellValue && cellValue.trim() !== '') {
            // Initialize array if needed
            if (!allowedOptions[questionId]) {
              allowedOptions[questionId] = [];
            }
            
            // Add option if not already in the array
            if (!allowedOptions[questionId].includes(cellValue)) {
              allowedOptions[questionId].push(cellValue);
            }
          }
        }
      }
      
      return allowedOptions;
    } catch (error: any) {
      logger.error('Error parsing answer options:', error);
      return {};
    }
  }
  /**
   * Save an uploaded file to the uploads directory
   * @param buffer - The file buffer
   * @param originalFilename - The original filename
   * @returns The path to the saved file
   */
  async saveUploadedFile(buffer: Buffer, originalFilename: string): Promise<string> {
    // Create a unique filename to avoid collisions
    const fileExtension = path.extname(originalFilename);
    const uniqueFilename = `${Date.now()}-${uuidv4()}${fileExtension}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFilename);

    // Write the file to disk
    await fs.promises.writeFile(filePath, buffer);
    logger.info(`File saved to ${filePath}`);

    return filePath;
  }

  /**
   * Read and parse a DEP XLSX file
   * @param filePath - Path to the XLSX file
   * @returns Parsed DEP file structure
   */
  async readDEPFile(filePath: string): Promise<DEPFileStructure> {
    try {
      // Validate file extension
      const fileExtension = path.extname(filePath).toLowerCase();
      if (fileExtension !== '.xlsx') {
        throw new Error('Invalid file format. Only XLSX files are supported.');
      }
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found at path: ${filePath}`);
      }
      
      // Load workbook with error handling
      const workbook = await this.loadWorkbook(filePath);

      // Validate workbook structure - DEP files should have at least 3 worksheets
      if (workbook.worksheets.length < 3) {
        throw new Error('Invalid DEP file format. Expected at least 3 worksheets.');
      }

      // Extract questions from sheet 2 (Assessment Responses - v2)
      const questionsSheet = workbook.getWorksheet(2);
      const questions: QuestionData[] = [];
      let preExistingAnswers = 0;
      const sectionCounts: Record<string, number> = {};

      if (!questionsSheet) {
        throw new Error('Questions sheet not found in the XLSX file');
      }
      
      // Validate sheet structure - check for expected headers
      const headerRow = questionsSheet.getRow(HDR_ROW);
      const questionHeader = headerRow.getCell(C_ID).text.trim();
      const descriptionHeader = headerRow.getCell(C_DESCRIPTION).text.trim();
      
      if (!questionHeader.includes('Question') || !descriptionHeader.includes('Description')) {
        throw new Error('Invalid DEP file format. Expected headers not found in questions sheet.');
      }

      // Try to find column indices dynamically
      const dynamicColQuestion = findColumnIndexByHeader(questionsSheet, 'Question');
      const dynamicColDescription = findColumnIndexByHeader(questionsSheet, 'Description');
      const dynamicColUniqueId = findColumnIndexByHeader(questionsSheet, 'Unique ID');
      const dynamicColResponse = findColumnIndexByHeader(questionsSheet, 'Response');
      
      // Use dynamic columns if found, otherwise use defaults
      const colQuestion = dynamicColQuestion !== -1 ? dynamicColQuestion : C_ID;
      const colDescription = dynamicColDescription !== -1 ? dynamicColDescription : C_DESCRIPTION;
      const colUniqueId = dynamicColUniqueId !== -1 ? dynamicColUniqueId : C_UNIQUE;
      const colResponse = dynamicColResponse !== -1 ? dynamicColResponse : C_ANSWER;
      
      // Process each row starting from DATA_START
      questionsSheet.eachRow((row: any, rowNumber: number) => {
        if (rowNumber >= DATA_START) {
          // Get cell values, ensuring we handle different cell value types
          const questionCell = row.getCell(colQuestion);
          const descriptionCell = row.getCell(colDescription);
          const uniqueIdCell = row.getCell(colUniqueId);
          const responseCell = row.getCell(colResponse);
          
          // Convert cell values to strings, handling different types
          const questionText = this.getCellValueAsString(questionCell);
          const description = this.getCellValueAsString(descriptionCell);
          const uniqueId = this.getCellValueAsString(uniqueIdCell);
          const response = this.getCellValueAsString(responseCell);
          
          // Skip empty rows
          if (!questionText || !uniqueId) {
            return;
          }
          
          // Extract section ID from question using the section-service
          const sectionId = getSectionFromId(questionText) || 'unknown';
          
          // Count questions by section
          sectionCounts[sectionId] = (sectionCounts[sectionId] || 0) + 1;
          
          // Check if the question already has a valid answer (not a placeholder)
          const isPlaceholder = this.isPlaceholderValue(response);
          if (response && response.trim() !== '' && !isPlaceholder) {
            preExistingAnswers++;
          }
          
          // Add the question to our list
          questions.push({
            id: questionText,
            question: description,
            answer: response || undefined,
            uniqueId: uniqueId
          });
        }
      });

      // Extract answer options from sheet 3 (Assessment Response Options)
      const optionsSheet = workbook.getWorksheet(3);
      const answerOptions: Record<string, string[]> = {};

      if (optionsSheet) {
        // Process each row to extract question ID and options
        optionsSheet.eachRow((row: any, rowNumber: number) => {
          if (rowNumber > 1) { // Skip header row
            const questionId = row.getCell(1).text.trim();
            const option = row.getCell(2).text.trim();

            if (questionId && option) {
              if (!answerOptions[questionId]) {
                answerOptions[questionId] = [];
              }
              answerOptions[questionId].push(option);
            }
          }
        });
        
        // Assign options to questions
        questions.forEach((question: QuestionData) => {
          if (answerOptions[question.id]) {
            question.options = answerOptions[question.id];
          }
        });
      }

      // Extract metadata from sheet 1 (Instructions)
      const metadataSheet = workbook.getWorksheet(1);
      const metadata: Record<string, any> = {
        sectionCounts
      };

      logger.info(`Read DEP file with ${questions.length} questions, ${preExistingAnswers} pre-existing answers`);
      logger.info(`Found ${Object.keys(sectionCounts).length} sections`);

      return { 
        questions, 
        answerOptions, 
        metadata, 
        preExistingAnswers,
        sectionCounts
      };
    } catch (error: any) {
      logger.error('Error reading DEP file:', error);
      throw new Error(`Failed to read DEP file: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Update a DEP XLSX file with new answers
   * @param filePath - Path to the XLSX file
   * @param updatedQuestions - Questions with updated answers
   * @returns Path to the updated file
   */
  async updateDEPFile(filePath: string, updatedQuestions: QuestionData[]): Promise<string> {
    console.time("XLSX-update");
    try {
      // Validate inputs
      if (!filePath || !fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      
      if (!updatedQuestions || !Array.isArray(updatedQuestions)) {
        throw new Error('Invalid questions data: Expected an array of questions');
      }
      
      // Verify that all questions have answers
      const unansweredQuestions = updatedQuestions.filter(q => !q.answer || q.answer.trim() === '');
      if (unansweredQuestions.length > 0) {
        const errorMsg = `Cannot update DEP file: ${unansweredQuestions.length} questions have no answers. First few: ${unansweredQuestions.slice(0, 5).map(q => q.id).join(', ')}`;
        logger.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      // Create a backup of the original file
      const backupFilePath = `${filePath}.backup-${Date.now()}`;
      try {
        await fs.promises.copyFile(filePath, backupFilePath);
        logger.info(`Created backup of original file at: ${backupFilePath}`);
      } catch (backupError: any) {
        logger.warn(`Failed to create backup: ${backupError.message}`);
        // Continue anyway - we'll log but not fail the operation
      }
      
      // Load workbook with error handling
      const workbook = await this.loadWorkbook(filePath);

      // Get the questions sheet (sheet 2)
      const questionsSheet = workbook.getWorksheet(2);

      if (!questionsSheet) {
        throw new Error('Questions sheet not found in the XLSX file');
      }

      // Try to find column indices dynamically
      const dynamicColQuestion = findColumnIndexByHeader(questionsSheet, 'Question');
      const dynamicColUniqueId = findColumnIndexByHeader(questionsSheet, 'Unique ID');
      const dynamicColResponse = findColumnIndexByHeader(questionsSheet, 'Response');
      
      // Use dynamic columns if found, otherwise use defaults
      const colQuestion = dynamicColQuestion !== -1 ? dynamicColQuestion : C_ID;
      const colUniqueId = dynamicColUniqueId !== -1 ? dynamicColUniqueId : C_UNIQUE;
      const colResponse = dynamicColResponse !== -1 ? dynamicColResponse : C_ANSWER;
      
      // Create maps of question IDs and unique IDs to their updated answers
      const answersByQuestionId = new Map<string, string>(
        updatedQuestions
          .filter(q => q.id && q.answer)
          .map(q => [q.id, q.answer as string])
      );
      
      const answersByUniqueId = new Map<string, string>(
        updatedQuestions
          .filter(q => q.uniqueId && q.answer)
          .map(q => [q.uniqueId as string, q.answer as string])
      );

      // Optional: Create a selective backup of just the response column
      const backupSheet = workbook.addWorksheet('_Backup_' + Date.now());
      backupSheet.addRow(['Row', 'Question ID', 'Original Answer']);
      
      // Process rows and update answers
      const processingStartTime = performance.now();
      let updatedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;
      
      for (let rowNumber = DATA_START; rowNumber <= questionsSheet.rowCount; rowNumber++) {
        try {
          const row = questionsSheet.getRow(rowNumber);
          
          // 1. Read the Question ID
          const questionId = row.getCell(colQuestion).text.trim();
          
          // Skip empty rows
          if (!questionId) {
            skippedCount++;
            continue;
          }
          
          // Add to backup
          const originalAnswer = row.getCell(colResponse).text.trim();
          backupSheet.addRow([rowNumber, questionId, originalAnswer]);
          
          // 2. Lookup answer by ID
          let answerValue = answersByQuestionId.get(questionId);
          
          // 3. Fallback to unique ID if needed
          if (answerValue === undefined) {
            const uniqueId = row.getCell(colUniqueId).text.trim();
            if (uniqueId) {
              answerValue = answersByUniqueId.get(uniqueId);
            }
          }
          
          // 4. Only overwrite if we have a value
          if (answerValue !== undefined) {
            const cell = row.getCell(colResponse);
            cell.value = answerValue; // Preserves existing style/formula
            updatedCount++;
          } else {
            skippedCount++;
          }
        } catch (rowError: any) {
          logger.warn(`Error processing row ${rowNumber}: ${rowError.message}`);
          errorCount++;
        }
      }
      
      // Log performance metrics
      const processingTime = performance.now() - processingStartTime;
      logger.info(
        `Processed ${questionsSheet.rowCount} rows in ${processingTime.toFixed(2)}ms: ` +
        `${updatedCount} updated, ${skippedCount} skipped, ${errorCount} errors`
      );

      // Save the updated workbook back to the original file
      try {
        await workbook.xlsx.writeFile(filePath);
        logger.info(`Updated file saved back to original file: ${filePath}`);
      } catch (writeError: any) {
        // Try to restore from backup if write fails
        logger.error(`Failed to write updated file: ${writeError.message}`);
        try {
          if (fs.existsSync(backupFilePath)) {
            await fs.promises.copyFile(backupFilePath, filePath);
            logger.info(`Restored from backup after failed write`);
          }
        } catch (restoreError: any) {
          logger.error(`Failed to restore from backup: ${restoreError.message}`);
        }
        throw new Error(`Failed to write updated Excel file: ${writeError.message}`);
      }
      
      console.timeEnd("XLSX-update");
      return filePath;
    } catch (error: any) {
      logger.error('Error updating DEP file:', error);
      throw new Error(`Failed to update DEP file: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Clean up old files from the uploads directory
   * @param maxAgeHours - Maximum age of files to keep (in hours)
   * @param excludePatterns - Array of regex patterns for files to exclude from cleanup
   */
  /**
   * Check if a value is a placeholder rather than a real answer
   * @param value - The value to check
   * @returns Whether the value is a placeholder
   */
  isPlaceholderValue(value: string): boolean {
    if (!value) return false;
    
    // Normalize the value for comparison
    const normalizedValue = value.trim().toLowerCase();
    
    // Common placeholder strings in dropdown fields
    const placeholders = [
      '—select—',
      '--select--',
      '---select---',
      'select',
      'please select',
      'choose an option',
      'select an option',
      'n/a',
      'not applicable',
      'tbd',
      'to be determined',
      'pending',
      'not specified',
      'not selected',
      'not set',
      'not provided'
    ];
    
    return placeholders.some(placeholder => 
      normalizedValue === placeholder || 
      normalizedValue.includes(placeholder)
    );
  }

  /**
   * Helper method to convert any cell value to a string
   * Handles different cell value types (string, number, boolean, date, etc.)
   * @param cell - The Excel cell
   * @returns The cell value as a string
   */
  getCellValueAsString(cell: ExcelJS.Cell): string {
    if (!cell) return '';
    
    // Handle different value types
    if (cell.value === null || cell.value === undefined) {
      return '';
    }
    
    // If the cell has a text property (rich text), use that
    if (cell.text) {
      return cell.text.trim();
    }
    
    // Handle different value types
    if (typeof cell.value === 'string') {
      return cell.value.trim();
    } else if (typeof cell.value === 'number') {
      return cell.value.toString();
    } else if (typeof cell.value === 'boolean') {
      return cell.value ? 'Yes' : 'No';
    } else if (cell.value instanceof Date) {
      return cell.value.toISOString().split('T')[0]; // YYYY-MM-DD format
    } else if (typeof cell.value === 'object' && cell.value !== null) {
      // Handle rich text or other complex objects
      if ('richText' in cell.value) {
        return cell.value.richText.map((rt: any) => rt.text).join('').trim();
      } else if ('text' in cell.value) {
        return cell.value.text.trim();
      } else if ('formula' in cell.value) {
        // For formula cells, try to get the result
        return cell.result ? cell.result.toString().trim() : '';
      }
      
      // Fallback for other object types
      try {
        return JSON.stringify(cell.value);
      } catch (e) {
        return '';
      }
    }
    
    // Final fallback
    return String(cell.value).trim();
  }

  async cleanupOldFiles(maxAgeHours = 24, excludePatterns: RegExp[] = []): Promise<void> {
    try {
      const files = await fs.promises.readdir(UPLOADS_DIR);
      const now = Date.now();
      const maxAgeMs = maxAgeHours * 60 * 60 * 1000;

      for (const file of files) {
        const filePath = path.join(UPLOADS_DIR, file);
        const stats = await fs.promises.stat(filePath);
        
        // Skip files that match exclude patterns
        const shouldExclude = excludePatterns.some(pattern => pattern.test(file));
        if (shouldExclude) {
          logger.info(`Skipping excluded file: ${filePath}`);
          continue;
        }

        // Check if the file is older than the maximum age
        if (now - stats.mtimeMs > maxAgeMs) {
          await fs.promises.unlink(filePath);
          logger.info(`Deleted old file: ${filePath}`);
        }
      }
    } catch (error: any) {
      logger.error('Error cleaning up old files:', error);
    }
  }
}

// Export a singleton instance
export const xlsxService = new XlsxService();
