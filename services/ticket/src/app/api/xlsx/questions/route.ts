import { NextRequest, NextResponse } from 'next/server';
import { XlsxService, xlsxService, QuestionData } from '@/services/xlsx/xlsx-service';
import { questionService } from '@/services/xlsx/question-service';
import { createLogger } from '@/lib/logger';

const logger = createLogger('xlsx-questions-api');

/**
 * API route for selecting key questions from an XLSX file
 * @param request - The incoming request
 * @returns Response with selected key questions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filePath, maxQuestions = 10 } = body;

    if (!filePath) {
      return NextResponse.json(
        { error: 'No file path provided' },
        { status: 400 }
      );
    }

    // Read the DEP file
    const fileData = await xlsxService.readDEPFile(filePath);

    // Select key questions
    const keyQuestions = questionService.selectAnchorQuestions(
      fileData.questions,
      [], // No existing answers
      maxQuestions
    );

    // Return the selected questions
    return NextResponse.json({
      success: true,
      keyQuestions,
      totalQuestions: fileData.questions.length,
    });
  } catch (error: any) {
    logger.error('Error selecting key questions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to select key questions' },
      { status: 500 }
    );
  }
}

/**
 * API route for predicting answers based on provided answers
 * @param request - The incoming request
 * @returns Response with predicted answers
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { filePath, answeredQuestions } = body;

    if (!filePath) {
      return NextResponse.json(
        { error: 'No file path provided' },
        { status: 400 }
      );
    }

    if (!answeredQuestions || !Array.isArray(answeredQuestions)) {
      return NextResponse.json(
        { error: 'Invalid answered questions data' },
        { status: 400 }
      );
    }

    // Read the DEP file
    const fileData = await xlsxService.readDEPFile(filePath);

    // Load the workbook and parse answer options
    const xlsxSvc = new XlsxService();
    const workbook = await xlsxSvc.loadWorkbook(filePath);
    const allowedOptions = await xlsxSvc.parseAnswerOptions(workbook);
    console.log(">>> Loaded allowedOptions:", allowedOptions);

    // Set allowed options in the question service
    questionService.setAllowedOptions(allowedOptions);

    // Predict answers for all questions using anchor answers
    const { 
      predictedQuestions, 
      answers, 
      metadata, 
      nextPrompt 
    } = await questionService.predictFromAnchors(
      fileData.questions,
      answeredQuestions
    );

    // Group questions by confidence level
    const highConfidence: QuestionData[] = [];
    const mediumConfidence: QuestionData[] = [];
    const lowConfidence: QuestionData[] = [];

    predictedQuestions.forEach(q => {
      const confidence = q.confidence || 0;
      if (confidence >= 0.7) {
        highConfidence.push(q);
      } else if (confidence >= 0.4) {
        mediumConfidence.push(q);
      } else if (confidence > 0) {
        lowConfidence.push(q);
      }
    });

    // Return the predicted questions and the next prompt
    return NextResponse.json({
      success: true,
      predictedQuestions,
      nextPrompt,
      confidenceLevels: {
        high: highConfidence.length,
        medium: mediumConfidence.length,
        low: lowConfidence.length,
        none: predictedQuestions.length - highConfidence.length - mediumConfidence.length - lowConfidence.length,
      },
    });
  } catch (error: any) {
    logger.error('Error predicting answers:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to predict answers' },
      { status: 500 }
    );
  }
}
