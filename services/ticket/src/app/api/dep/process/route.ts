import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';
import { XlsxService, xlsxService, QuestionData } from '@/services/xlsx/xlsx-service';
import { questionService } from '@/services/xlsx/question-service';
import { SKIPPED_ANSWER } from '@/constants';
import fs from 'fs';
import path from 'path';

const logger = createLogger('dep-process-api');

/**
 * API route for processing a DEP file
 * 
 * This route:
 * 1. Receives a DEP file and anchor answers
 * 2. Predicts answers for the remaining questions
 * 3. Updates the DEP file with the predicted answers
 * 4. Returns the path to the updated file
 */
export async function POST(req: NextRequest) {
  try {
    // Check content type to determine how to handle the request
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle form data with file upload
      const formData = await req.formData();
      
      // Get the file from the form data
      const file = formData.get('file') as File;
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }
      
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.xlsx')) {
        return NextResponse.json({ 
          error: 'Invalid file format. Only XLSX files are supported.' 
        }, { status: 400 });
      }
      
      // Validate file size (20MB max)
      const MAX_SIZE = 20 * 1024 * 1024; // 20MB in bytes
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ 
          error: 'File size exceeds 20MB limit' 
        }, { status: 400 });
      }
      
      // Get the anchor answers from the form data
      const anchorAnswersJson = formData.get('anchorAnswers') as string;
      if (!anchorAnswersJson) {
        return NextResponse.json({ error: 'No anchor answers provided' }, { status: 400 });
      }
      
      // Parse the anchor answers
      let anchorAnswers: [string, string][];
      try {
        anchorAnswers = JSON.parse(anchorAnswersJson) as [string, string][];
        
        // Validate anchor answers format
        if (!Array.isArray(anchorAnswers) || 
            !anchorAnswers.every(item => 
              Array.isArray(item) && 
              item.length === 2 && 
              typeof item[0] === 'string' && 
              typeof item[1] === 'string'
            )) {
          throw new Error('Invalid format');
        }
      } catch (error) {
        return NextResponse.json({ 
          error: 'Invalid anchor answers format. Expected array of [questionId, answer] pairs.' 
        }, { status: 400 });
      }
      
      // Convert the file to a buffer
      const buffer = Buffer.from(await file.arrayBuffer());
      
      // Save the file to disk
      const filePath = await xlsxService.saveUploadedFile(buffer, file.name);
      logger.info(`File saved to ${filePath}`);
      
      // Read the DEP file
      const depFile = await xlsxService.readDEPFile(filePath);
      logger.info(`Read DEP file with ${depFile.questions.length} questions`);
      
      // Predict answers for the remaining questions
      const predictionResult = await questionService.predictFromAnchors(
        depFile.questions, 
        anchorAnswers
      );
      
      // Extract the predicted questions array and next prompt
      const { predictedQuestions, nextPrompt } = predictionResult;
      
      // Count questions with answers
      const answeredCount = predictedQuestions.filter((q: QuestionData) => q.answer && q.answer.trim() !== '').length;
      logger.info(`Predicted answers for ${answeredCount} out of ${depFile.questions.length} questions`);
      
      // Update the DEP file with the predicted answers
      const updatedFilePath = await xlsxService.updateDEPFile(filePath, predictedQuestions);
      logger.info(`Updated file saved to ${updatedFilePath}`);
      
      // Get the filename from the path
      const filename = path.basename(updatedFilePath);
      
      // Create a sanitized copy of the questions for the UI
      const sanitizedQuestions = predictedQuestions.map(q => {
        if (q.answer === SKIPPED_ANSWER) {
          // Replace SKIPPED_ANSWER with null and mark for review
          return {
            ...q,
            answer: null,
            metadata: {
              ...(q.metadata || {}),
              needsReview: true,
              skipped: true
            }
          };
        }
        return q;
      });
      
      // Count skipped questions
      const skippedCount = predictedQuestions.filter(q => q.metadata?.skipped).length;
      
      // Return the path to the updated file (which is now the same as the original)
      return NextResponse.json({ 
        success: true,
        filePath: filePath, // Use the original file path since we're overwriting it
        filename,
        questions: sanitizedQuestions, // Include the sanitized questions with metadata
        stats: {
          totalQuestions: depFile.questions.length,
          answeredQuestions: answeredCount,
          preExistingAnswers: depFile.preExistingAnswers,
          predictedAnswers: answeredCount - depFile.preExistingAnswers - anchorAnswers.length,
          skippedQuestions: skippedCount
        }
      });
    } else if (contentType.includes('application/json')) {
      // Handle JSON request
      const json = await req.json();
      
      if (!json.filePath) {
        return NextResponse.json({ error: 'No filePath provided' }, { status: 400 });
      }
      
      const filePath = json.filePath;
      const action = json.action || 'read';
      
      // Verify the file exists
      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'File not found at the specified path' }, { status: 404 });
      }
      
      if (action === 'read') {
        // Read the DEP file
        const depFile = await xlsxService.readDEPFile(filePath);
        logger.info(`Read DEP file with ${depFile.questions.length} questions`);
        
        return NextResponse.json({
          success: true,
          questions: depFile.questions,
          preExistingAnswers: depFile.preExistingAnswers,
          sectionCounts: depFile.sectionCounts
        });
      } else if (action === 'update') {
        // Get the answers from the request
        const answers = json.answers;
        if (!answers || !Array.isArray(answers)) {
          return NextResponse.json({ error: 'No answers provided or invalid format' }, { status: 400 });
        }
        
        // Update the DEP file with the provided answers
        const updatedFilePath = await xlsxService.updateDEPFile(filePath, answers);
        logger.info(`Updated file saved to ${updatedFilePath}`);
        
        // Get the filename from the path
        const filename = path.basename(updatedFilePath);
        
        return NextResponse.json({
          success: true,
          updatedFilePath,
          filename
        });
      } else {
        return NextResponse.json({ error: `Invalid action: ${action}` }, { status: 400 });
      }
    } else {
      return NextResponse.json({ 
        error: 'Content-Type must be multipart/form-data or application/json' 
      }, { status: 400 });
    }
  } catch (error: any) {
    logger.error('Error processing DEP file:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
