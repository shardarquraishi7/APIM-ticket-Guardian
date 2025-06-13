import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';
import { XlsxService, xlsxService } from '@/services/xlsx/xlsx-service';
import { questionService } from '@/services/xlsx/question-service';
import { anchorQuestions as depAnchorQuestions } from '@/ai/prompts/depQuestionsData';
import fs from 'fs';
import path from 'path';

const logger = createLogger('dep-analyze-api');

/**
 * API route for analyzing a DEP file
 * 
 * This route:
 * 1. Receives a DEP file or a file path
 * 2. Analyzes the file to select anchor questions
 * 3. Returns the selected anchor questions
 */
export async function POST(req: NextRequest) {
  try {
    let filePath: string;
    let fileName: string;
    let maxQuestions = 10;
    
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
      
      // Get the maximum number of anchor questions to select
      const maxQuestionsStr = formData.get('maxQuestions') as string;
      maxQuestions = maxQuestionsStr ? parseInt(maxQuestionsStr, 10) : 7; // Default to 7 anchor questions
      
      // Convert the file to a buffer
      const buffer = Buffer.from(await file.arrayBuffer());
      
      // Save the file to disk
      filePath = await xlsxService.saveUploadedFile(buffer, file.name);
      fileName = file.name;
      logger.info(`File saved to ${filePath}`);
    } else if (contentType.includes('application/json')) {
      // Handle JSON request with file path
      const json = await req.json();
      
      if (!json.filePath) {
        return NextResponse.json({ error: 'No filePath provided' }, { status: 400 });
      }
      
      filePath = json.filePath;
      fileName = json.fileName || path.basename(filePath);
      maxQuestions = json.maxQuestions || 10;
      
      // Verify the file exists
      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'File not found at the specified path' }, { status: 404 });
      }
      
      logger.info(`Using existing file at ${filePath}`);
    } else {
      return NextResponse.json({ 
        error: 'Content-Type must be multipart/form-data or application/json' 
      }, { status: 400 });
    }
    
    try {
      // Read the DEP file
      const depFile = await xlsxService.readDEPFile(filePath);
      logger.info(`Read DEP file with ${depFile.questions.length} questions`);
      
      // Get existing answers from the file
      const existingAnswers = depFile.questions
        .filter(q => q.answer && q.answer.trim() !== '')
        .map(q => [q.id, q.answer] as [string, string]);
      
      // Select anchor questions
      const anchorQuestions = questionService.selectAnchorQuestions(
        depFile.questions, 
        existingAnswers,
        maxQuestions
      );
      
      logger.info(`Selected ${anchorQuestions.length} anchor questions`);
      
      // Format the first question with enhanced formatting
      const formatQuestion = (question: any) => {
        // Find the matching anchor question from our predefined list
        const anchorQuestion = question.id ? 
          depAnchorQuestions.find((q: { id: string }) => q.id === question.id) : null;
        
        // Use the question text from our predefined list if available, otherwise use from Excel
        const questionText = anchorQuestion ? 
          (anchorQuestion.questionText || question.question) : question.question;
        
        // Extract just the question number for display
        const questionIdMatch = question.id.match(/^(\d+\.\d+)/);
        const questionNumber = questionIdMatch ? questionIdMatch[1] : question.id;
        
        // Format the question in a way that preserves the exact question text
        let formattedQuestion = `Question ${questionNumber}: ${questionText}`;
        
        // Use options from our predefined list if available, otherwise use from Excel
        const options = anchorQuestion && anchorQuestion.options ? 
          anchorQuestion.options : question.options;
        
        if (options && options.length > 0) {
          formattedQuestion += '\n\nOptions:';
          options.forEach((option: string, index: number) => {
            formattedQuestion += `\n${index + 1}. ${option}`;
          });
        }
        
        return formattedQuestion;
      };
      
      // Create a message for the user
      let message = `I've analyzed your DEP file "${fileName}" and found ${depFile.questions.length} questions, with ${depFile.preExistingAnswers} already answered.
      
Based on my analysis, I've identified ${anchorQuestions.length} key anchor questions that will help me predict answers for the remaining questions.

Let's start with the first question:\n\n`;
      
      // Add the first question if there are any anchor questions
      if (anchorQuestions.length > 0) {
        // Find the matching anchor question from our predefined list to get the explanation
        const firstQuestion = anchorQuestions[0];
        const questionObj = depAnchorQuestions.find(q => q.id === firstQuestion.id);
        
        // Extract just the question number for display
        const questionIdMatch = firstQuestion.id.match(/^(\d+\.\d+)/);
        const questionNumber = questionIdMatch ? questionIdMatch[1] : firstQuestion.id;
        
        // Get the actual question text from our predefined list if available
        const questionText = questionObj ? 
          (questionObj.questionText || firstQuestion.question) : firstQuestion.question;
        
        // Add explanation if available
        if (questionObj?.explanation) {
          message += `**Context:** ${questionObj.explanation}\n\n`;
        }
        
        // Format the question directly to ensure the correct text is displayed
        message += `Question ${questionNumber}: ${questionText}`;
        
        // Add options if available
        const options = questionObj && questionObj.options ? 
          questionObj.options : firstQuestion.options;
        
        if (options && options.length > 0) {
          message += '\n\nOptions:';
          options.forEach((option: string, index: number) => {
            message += `\n${index + 1}. ${option}`;
          });
        }
      }
      
      // Generate a detailed prompt for the first question
      let nextPrompt = '';
      if (anchorQuestions.length > 0) {
        const firstQuestion = anchorQuestions[0];
        const questionObj = depAnchorQuestions.find(q => q.id === firstQuestion.id);
        
        // Extract just the question number for display
        const questionIdMatch = firstQuestion.id.match(/^(\d+\.\d+)/);
        const questionNumber = questionIdMatch ? questionIdMatch[1] : firstQuestion.id;
        
        // Get the question text from our predefined list if available
        const questionText = questionObj ? 
          (questionObj.questionText || firstQuestion.question) : firstQuestion.question;
        
        // Get the cluster information
        const clusterMatch = questionNumber.match(/^(\d+)\./);
        const clusterNumber = clusterMatch ? clusterMatch[1] : '';
        
        // Create a detailed prompt with all the information
        nextPrompt = `Question ${questionNumber}: ${questionText}\n\n`;
        
        // Use options from our predefined list if available, otherwise use from Excel
        const options = questionObj && questionObj.options ? 
          questionObj.options : firstQuestion.options;
        
        if (options && options.length > 0) {
          nextPrompt += 'Options:\n';
          options.forEach((option: string, index: number) => {
            nextPrompt += `${index + 1}. ${option}\n`;
          });
        }
        
        // Add cluster information if available
        if (clusterNumber) {
          nextPrompt += `\nThis question is part of Cluster ${clusterNumber}.`;
        }
        
        // Add explanation if available
        if (questionObj?.explanation) {
          nextPrompt += `\n\nExplanation: ${questionObj.explanation}`;
        }
      }
      
      // Return the selected anchor questions, state, and next prompt
      return NextResponse.json({ 
        success: true,
        message,
        nextPrompt: nextPrompt || undefined,
        state: {
          fileName,
          filePath,
          totalQuestions: depFile.questions.length,
          answeredQuestions: depFile.preExistingAnswers,
          preExistingAnswers: depFile.preExistingAnswers,
          predictedAnswers: 0,
          anchorQuestions: anchorQuestions.map(q => ({
            id: q.id,
            question: q.question,
            options: q.options || []
          })),
          currentQuestionIndex: 0,
          sectionCounts: depFile.sectionCounts
        }
      });
    } catch (readError: any) {
      logger.error('Error reading or processing DEP file:', readError);
      return NextResponse.json({ 
        error: `Error analyzing DEP file: ${readError.message || 'Unknown error'}. Please ensure this is a valid DEP Excel file.` 
      }, { status: 422 });
    }
  } catch (error: any) {
    logger.error('Error analyzing DEP file:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
