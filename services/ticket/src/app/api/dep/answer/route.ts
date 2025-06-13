import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';
import { anchorQuestions as depAnchorQuestions } from '@/ai/prompts/depQuestionsData';
import { getQuestionById } from '@/ai/prompts/questions';
import { xlsxService } from '@/services/xlsx/xlsx-service';
import { questionService } from '@/services/xlsx/question-service';

const logger = createLogger('dep-answer-api');

/**
 * API route for generating an answer to a DEP question using AI
 * 
 * This route:
 * 1. Receives a question ID and context
 * 2. Uses AI to generate an appropriate answer
 * 3. Returns the generated answer
 */
export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    
    // Get the question ID and context
    const { questionId, context, state, answer, imageAttachments = [] } = body;
    
    if (!questionId) {
      return NextResponse.json({ error: 'No question ID provided' }, { status: 400 });
    }
    
    if (!state) {
      return NextResponse.json({ error: 'No state provided' }, { status: 400 });
    }
    
    // Validate state structure
    if (!state.anchorQuestions || !Array.isArray(state.anchorQuestions) || 
        typeof state.currentQuestionIndex !== 'number') {
      return NextResponse.json({ 
        error: 'Invalid state structure. Expected anchorQuestions array and currentQuestionIndex.' 
      }, { status: 400 });
    }
    
    // Validate current question index
    if (state.currentQuestionIndex < 0 || 
        state.currentQuestionIndex >= state.anchorQuestions.length) {
      return NextResponse.json({ 
        error: 'Invalid currentQuestionIndex. Out of bounds.' 
      }, { status: 400 });
    }
    
    // Validate answer
    if (answer === undefined || answer === null) {
      return NextResponse.json({ error: 'No answer provided' }, { status: 400 });
    }
    
    // Validate image attachments if provided
    if (imageAttachments && !Array.isArray(imageAttachments)) {
      return NextResponse.json({ 
        error: 'Invalid imageAttachments. Expected an array.' 
      }, { status: 400 });
    }
    
    // Find the question in our knowledge base
    const question = getQuestionById(questionId);
    const questionText = question?.text || '';
    const options = question?.options || [];
    
    // Get the current question from the state
    const currentQuestion = state?.anchorQuestions?.[state.currentQuestionIndex];
    
    // Prepare the system prompt
    const systemPrompt = `
You are an expert in data ethics and privacy, helping to complete a Data Ethics Process (DEP) questionnaire.
Your task is to provide guidance on answering DEP questions and to help predict answers for remaining questions.
`;
    
    // Prepare the user prompt
    const userPrompt = `
I'm working on a DEP questionnaire and need help with the following question:

QUESTION ID: ${questionId}
QUESTION: ${questionText}

${options.length > 0 ? `AVAILABLE OPTIONS:
${options.map((opt: string) => `- ${opt}`).join('\n')}` : ''}

${context ? `CONTEXT:
${context}` : ''}

Please provide a concise, appropriate answer to this question based on the information provided.
If options are available, select the most appropriate option.
If no options are available, provide a brief, professional response.
`;
    
    // Update the state
    const updatedState = { ...state };
    
    // Store the answer for the current question
    if (state.currentQuestionIndex < state.anchorQuestions.length) {
      updatedState.anchorQuestions[state.currentQuestionIndex].answer = answer;
      
      // Store image attachments if any
      if (imageAttachments.length > 0) {
        updatedState.anchorQuestions[state.currentQuestionIndex].imageAttachments = imageAttachments;
      }
    }
    
    // Move to the next question
    updatedState.currentQuestionIndex = (state.currentQuestionIndex || 0) + 1;
    
    // Check if we have more questions
    let message = '';
    if (updatedState.currentQuestionIndex < (updatedState.anchorQuestions?.length || 0)) {
      // Get the next question
      const nextQuestion = updatedState.anchorQuestions[updatedState.currentQuestionIndex];
      
      // Create response message with progress indicator
      const progress = Math.round((updatedState.currentQuestionIndex + 1) / updatedState.anchorQuestions.length * 100);
      
      // Extract just the question number for display
      const questionIdMatch = nextQuestion.id.match(/^(\d+\.\d+)/);
      const questionNumber = questionIdMatch ? questionIdMatch[1] : nextQuestion.id;
      
      // Get the question text from our knowledge base if available
      const nextQuestionObj = getQuestionById(nextQuestion.id);
      const nextQuestionText = nextQuestionObj?.text || nextQuestion.questionText || nextQuestion.question || '';
      
      message = `Thank you for your answer. Progress: ${progress}% (${updatedState.currentQuestionIndex + 1}/${updatedState.anchorQuestions.length})\n\nLet's continue with the next question:`;
      
      // Add explanation/context if available
      if (nextQuestionObj?.explanation) {
        message += `\n\n**Context:** ${nextQuestionObj.explanation}`;
      }
      
      // Format the question directly to ensure the correct text is displayed
      message += `\n\nQuestion ${questionNumber}: ${nextQuestionText}`;
      
      // Add options if available
      const options = nextQuestionObj?.options || nextQuestion.options;
      if (options && options.length > 0) {
        message += '\n\nOptions:';
        options.forEach((option: string, index: number) => {
          message += `\n${index + 1}. ${option}`;
        });
      }
    } else {
      // No more questions, proceed to prediction
      message = `Thank you for answering all the questions. I'm now automatically predicting answers for the remaining 200+ questions across all 13 clusters based on your responses.`;
      
      // Mark as completed
      updatedState.completed = true;
      
      try {
        // Convert the anchor answers to the format expected by the prediction service
        const anchorAnswers: [string, string][] = updatedState.anchorQuestions
          .filter((q: any) => q.answer !== undefined)
          .map((q: any) => [q.id, q.answer]);
        
        // Get the file path from the state
        const filePath = updatedState.filePath;
        
        if (filePath && anchorAnswers.length > 0) {
          // Read the DEP file
          const depFile = await xlsxService.readDEPFile(filePath);
          logger.info(`Read DEP file with ${depFile.questions.length} questions for inference`);
          
          // Predict answers for the remaining questions
          const predictionResult = await questionService.predictFromAnchors(
            depFile.questions, 
            anchorAnswers
          );
          
          // Extract the predicted questions array
          const predictedQuestions = predictionResult.predictedQuestions;
          
          // Count questions with answers
          const answeredCount = predictedQuestions.filter((q: any) => q.answer && q.answer.trim() !== '').length;
          logger.info(`Predicted answers for ${answeredCount} out of ${depFile.questions.length} questions`);
          
          // Update the DEP file with the predicted answers
          const updatedFilePath = await xlsxService.updateDEPFile(filePath, predictedQuestions);
          logger.info(`Updated file saved to ${updatedFilePath}`);
          
          // Add prediction results to the state
          updatedState.predictionResults = {
            totalQuestions: depFile.questions.length,
            answeredQuestions: answeredCount,
            preExistingAnswers: depFile.preExistingAnswers,
            predictedAnswers: answeredCount - depFile.preExistingAnswers - anchorAnswers.length,
            updatedFilePath
          };
          
          // Update the message with prediction results
          message += `\n\nI've successfully predicted answers for ${answeredCount - depFile.preExistingAnswers - anchorAnswers.length} additional questions based on your ${anchorAnswers.length} anchor answers. The updated DEP file has been saved.`;
        } else {
          logger.warn(`Cannot run inference: filePath=${filePath}, anchorAnswers.length=${anchorAnswers.length}`);
          message += `\n\nHowever, I couldn't automatically run the inference process. Please use the "Process DEP" button to manually trigger the prediction.`;
        }
      } catch (error: any) {
        logger.error('Error running automatic inference:', error);
        message += `\n\nI encountered an error while trying to automatically predict the remaining answers: ${error.message}. Please use the "Process DEP" button to manually trigger the prediction.`;
      }
    }
    
    logger.info(`Processed answer for question ${questionId}, moving to next question`);
    
    // Generate a more detailed prompt for the next question if available
    let nextPrompt = '';
    if (updatedState.currentQuestionIndex < (updatedState.anchorQuestions?.length || 0)) {
      const nextQuestion = updatedState.anchorQuestions[updatedState.currentQuestionIndex];
      const nextQuestionObj = getQuestionById(nextQuestion.id);
      
      // Extract just the question number for display
      const questionIdMatch = nextQuestion.id.match(/^(\d+\.\d+)/);
      const questionNumber = questionIdMatch ? questionIdMatch[1] : nextQuestion.id;
      
      // Get the question text from our knowledge base if available
      const nextQuestionText = nextQuestionObj?.text || nextQuestion.questionText || nextQuestion.question || '';
      
      // Get the cluster information
      const clusterMatch = questionNumber.match(/^(\d+)\./);
      const clusterNumber = clusterMatch ? clusterMatch[1] : '';
      
      // Create a detailed prompt with all the information in the exact format expected by the system prompt
      nextPrompt = `**Why we're asking ${questionNumber}:** ${nextQuestionObj?.explanation || ''}\n\n**Actual Question (${questionNumber}):** ${nextQuestionText}\n\n`;
      
      // Add options in the expected format
      if (nextQuestion.options && nextQuestion.options.length > 0) {
        nextPrompt += `Available options: ${nextQuestion.options.join(' | ')}`;
      }
      
      // Add cluster information if available
      if (clusterNumber) {
        nextPrompt += `\n\nThis question is part of Cluster ${clusterNumber}.`;
      }
      
      // Add the final instruction
      nextPrompt += `\n\nPlease type your answer exactly as required.`;
    }
    
    // Return the message, updated state, and next prompt
    return NextResponse.json({ 
      success: true,
      message,
      state: updatedState,
      nextPrompt: nextPrompt || undefined
    });
  } catch (error: any) {
    logger.error('Error generating answer:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
