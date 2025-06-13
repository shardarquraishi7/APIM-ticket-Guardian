import { createLogger } from '@/lib/logger';
import { vercelOpenai } from '@/lib/openai';
import { CHAT_MODEL } from '@/constants';
import { streamText } from 'ai';
import { questionService } from '@/services/xlsx/question-service';

const logger = createLogger('dep-handler');

/**
 * Interface for uploaded image
 */
export interface UploadedImage {
  url: string;
  fileName: string;
  filePath: string;
}

/**
 * Interface for question data
 */
export interface QuestionData {
  id: string;
  question: string;
  questionText?: string; // Added for compatibility with the new field name
  answer?: string;
  options?: string[];
  confidence?: number;
  uniqueId?: string; // Unique identifier from the Excel file
  imageAttachments?: UploadedImage[]; // Image attachments for the question
}

/**
 * Interface for DEP file upload data
 */
interface DEPFileUploadData {
  filePath: string;
  fileName: string;
  type: 'dep-file-upload';
}

/**
 * Interface for DEP question answer data
 */
interface DEPQuestionAnswerData {
  questionId: string;
  answer: string;
  imageAttachments?: UploadedImage[]; // Image attachments for the question
  type: 'dep-question-answer';
  state: DEPConversationState; // Current conversation state
}

/**
 * Interface for DEP conversation state
 */
interface DEPConversationState {
  filePath: string;
  fileName: string;
  currentQuestionIndex: number;
  anchorQuestions: QuestionData[];
  anchorAnswers: [string, string][]; // Always use array format for serialization
  predictedAnswers?: QuestionData[];
  updatedFilePath?: string;
  completed: boolean;
}

/**
 * Check if data is DEP file upload data
 */
export function isDEPFileUploadData(data: any): data is DEPFileUploadData {
  const isDepUpload = data && data.type === 'dep-file-upload' && data.filePath;
  console.log('isDEPFileUploadData check:', { data, isDepUpload });
  return isDepUpload;
}

/**
 * Check if data is DEP question answer data
 */
export function isDEPQuestionAnswerData(data: any): data is DEPQuestionAnswerData {
  return data && data.type === 'dep-question-answer' && data.questionId && data.answer !== undefined;
}

/**
 * Get DEP conversation state from chat state
 */
export function getDEPConversationState(chatState: any): DEPConversationState | null {
  if (chatState && chatState.dep) {
    return chatState.dep;
  }
  return null;
}

/**
 * Handle DEP file upload
 */
export async function handleDEPFileUpload(data: DEPFileUploadData): Promise<{
  message: string;
  state: DEPConversationState;
}> {
  try {
    console.log('handleDEPFileUpload called with data:', data);
    
    // Process the file using the API route
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const apiUrl = `${baseUrl}/api/dep/process`;
    console.log('Calling DEP process API at:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filePath: data.filePath,
        action: 'read',
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to process DEP file');
    }

    const fileData = await response.json();
    
    // Create map of existing answers
    const existingAnswers = new Map<string, string>();
    fileData.questions.forEach((q: QuestionData) => {
      if (q.answer && q.answer.trim() !== '') {
        existingAnswers.set(q.id, q.answer);
      }
    });
    
    // Select anchor questions using the question service
    const anchorQuestions = questionService.selectAnchorQuestions(
      fileData.questions,
      existingAnswers,
      8 // Maximum number of questions to ask
    );
    
    // Create conversation state with serializable data
    const state: DEPConversationState = {
      filePath: data.filePath,
      fileName: data.fileName,
      currentQuestionIndex: 0,
      anchorQuestions: anchorQuestions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options || [],
        uniqueId: q.uniqueId // Preserve the uniqueId
      })),
      anchorAnswers: Array.from(existingAnswers.entries()),
      completed: anchorQuestions.length === 0
    };
    
    // Create response message with more detailed summary
    let message = `I've received your DEP Excel file: **${data.fileName}**.\n\n`;
    
    // Add file summary
    message += `**File Summary:**\n`;
    message += `- Total Questions: ${fileData.questions.length}\n`;
    
    if (fileData.preExistingAnswers > 0) {
      const completionPercentage = Math.round((fileData.preExistingAnswers / fileData.questions.length) * 100);
      message += `- Pre-existing Answers: ${fileData.preExistingAnswers} (${completionPercentage}% complete)\n`;
    } else {
      message += `- Pre-existing Answers: 0 (0% complete)\n`;
    }
    
    // Add section breakdown if available
    if (fileData.sectionCounts && Object.keys(fileData.sectionCounts).length > 0) {
      message += `- Sections: ${Object.keys(fileData.sectionCounts).length}\n\n`;
      
      // Show top 3 largest sections
      const sortedSections = Object.entries(fileData.sectionCounts)
        .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
        .slice(0, 3);
      
      if (sortedSections.length > 0) {
        message += `**Largest Sections:**\n`;
        sortedSections.forEach(([section, count]) => {
          message += `- Section ${section}: ${count} questions\n`;
        });
        message += `\n`;
      }
    }
    
    if (anchorQuestions.length > 0) {
      message += `Based on our research, I'll ask you ${anchorQuestions.length} key questions to help predict the remaining answers. Your responses to these specific questions will allow me to intelligently fill in the rest of the DEP form.\n\n`;
      message += `Let's start with the first question:\n\n`;
      message += formatQuestion(anchorQuestions[0]);
      
      // Log the first question for debugging
      logger.info(`First question: ${anchorQuestions[0].id} - ${anchorQuestions[0].question}`);
    } else {
      // If no anchor questions (all already answered), proceed to prediction
      state.completed = true;
      message += `All questions already have answers. You can download the file to review or make any necessary adjustments.`;
    }
    
    // Add file info to the message for UI display
    message += `\n\n<file-info>${JSON.stringify({
      fileName: data.fileName,
      filePath: data.filePath,
      questionCount: fileData.questions.length,
      preExistingAnswers: fileData.preExistingAnswers
    })}</file-info>`;
    
    return { message, state };
  } catch (error: any) {
    logger.error('Error handling DEP file upload:', error);
    throw new Error(`Failed to process DEP file: ${error.message}`);
  }
}

/**
 * Handle DEP question answer
 */
export async function handleDEPQuestionAnswer(
  data: DEPQuestionAnswerData,
  state: DEPConversationState
): Promise<{
  message: string;
  state: DEPConversationState;
}> {
  try {
    // Work with the array format for better serialization
    // Find if the question already has an answer
    const existingAnswerIndex = state.anchorAnswers.findIndex(([id]) => id === data.questionId);
    
    if (existingAnswerIndex >= 0) {
      // Update existing answer
      state.anchorAnswers[existingAnswerIndex] = [data.questionId, data.answer];
    } else {
      // Add new answer
      state.anchorAnswers.push([data.questionId, data.answer]);
    }
    
    // Store image attachments if provided
    if (data.imageAttachments && data.imageAttachments.length > 0) {
      // Find the current question in the anchor questions array
      const questionIndex = state.anchorQuestions.findIndex(q => q.id === data.questionId);
      if (questionIndex >= 0) {
        // Update the question with image attachments
        state.anchorQuestions[questionIndex].imageAttachments = data.imageAttachments;
      }
    }
    
    // Move to the next question
    state.currentQuestionIndex++;
    
    // Check if we have more questions
    if (state.currentQuestionIndex < state.anchorQuestions.length) {
      // Get the next question
      const nextQuestion = state.anchorQuestions[state.currentQuestionIndex];
      
      // Create response message with progress indicator
      const progress = Math.round((state.currentQuestionIndex + 1) / state.anchorQuestions.length * 100);
      const message = `Thank you for your answer. Progress: ${progress}% (${state.currentQuestionIndex + 1}/${state.anchorQuestions.length})\n\nLet's continue with the next question:\n\n${formatQuestion(nextQuestion)}`;
      
      return { message, state };
    } else {
      // No more questions, proceed to prediction
      logger.info('All anchor questions answered, proceeding to prediction');
      
      // Process the file to get all questions
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await fetch(`${baseUrl}/api/dep/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filePath: state.filePath,
          action: 'read',
        }),
        cache: 'no-store',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process DEP file');
      }

      const fileData = await response.json();
      
      // Create a Map from the array for easier lookup
      const answerMap = new Map(state.anchorAnswers);
      
      // Predict answers for remaining questions
      logger.info(`Predicting answers for ${fileData.questions.length} questions based on ${answerMap.size} anchor answers`);
      
      // Convert to Map for the prediction function
      const predictionResult = await questionService.predictFromAnchors(
        fileData.questions,
        answerMap
      );
      
      // Extract the predicted questions array
      const predictedQuestions = predictionResult.predictedQuestions;
      
      // Store predicted answers in state
      state.predictedAnswers = predictedQuestions;
      
      // Update the file with all answers (user-provided and predicted)
      const updateResponse = await fetch(`${baseUrl}/api/dep/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filePath: state.filePath,
          action: 'update',
          answers: predictionResult.predictedQuestions.map(q => ({
            id: q.id,
            answer: q.answer,
            confidence: q.confidence || 1,
            uniqueId: q.uniqueId // Include the uniqueId if available
          })),
        }),
        cache: 'no-store',
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || 'Failed to update DEP file');
      }

      const updateResult = await updateResponse.json();
      
      // Verify the update was successful by checking the response
      if (!updateResult.success || !updateResult.updatedFilePath) {
        throw new Error('Update response indicates failure or missing file path');
      }
      
      // Since we're now overwriting the original file, the updated file path is the same as the original
      state.updatedFilePath = state.filePath;
      state.completed = true;
      
      // Count predicted answers
      const predictedCount = predictionResult.predictedQuestions.filter(q => {
        // Check if the answer exists and is not empty
        if (!q.answer || q.answer.trim() === '') {
          return false;
        }
        
        // Check if this is an anchor question (user-provided answer)
        if (answerMap.has(q.id)) {
          return false;
        }
        
        return true;
      }).length;
      
      // Create response message with detailed summary
      let message = `Thank you for answering all the questions. Based on your responses, I've predicted answers for ${predictedCount} additional questions and updated the DEP file.\n\n`;
      
      // Add prediction summary
      message += `**Prediction Summary:**\n`;
      message += `- User-provided answers: ${answerMap.size}\n`;
      message += `- AI-predicted answers: ${predictedCount}\n`;
      message += `- Total questions answered: ${answerMap.size + predictedCount}\n`;
      message += `- Completion rate: ${Math.round((answerMap.size + predictedCount) / fileData.questions.length * 100)}%\n\n`;
      
      // Add confidence information
      const highConfidencePredictions = predictionResult.predictedQuestions.filter(q => q.confidence && q.confidence >= 0.7).length;
      const mediumConfidencePredictions = predictionResult.predictedQuestions.filter(q => q.confidence && q.confidence >= 0.4 && q.confidence < 0.7).length;
      const lowConfidencePredictions = predictionResult.predictedQuestions.filter(q => q.confidence && q.confidence < 0.4).length;
      
      message += `**Prediction Confidence:**\n`;
      message += `- High confidence: ${highConfidencePredictions} predictions\n`;
      message += `- Medium confidence: ${mediumConfidencePredictions} predictions\n`;
      message += `- Low confidence: ${lowConfidencePredictions} predictions\n\n`;
      
      message += `You can download the completed DEP file here:`;
      
      return { message, state };
    }
  } catch (error: any) {
    logger.error('Error handling DEP question answer:', error);
    throw new Error(`Failed to process answer: ${error.message}`);
  }
}

import { anchorQuestions as depAnchorQuestions } from '@/ai/prompts/depQuestionsData';

/**
 * Format a question for display with enhanced information
 */
function formatQuestion(question: QuestionData): string {
  // Find the matching anchor question from our predefined list
  const anchorQuestion = depAnchorQuestions.find(q => q.id === question.id);
  
  // Use the question text from our predefined list if available, otherwise use from Excel
  const questionText = anchorQuestion ? 
    (anchorQuestion.questionText || question.questionText || question.question) : (question.questionText || question.question);
  
  // Extract just the question number for display
  const questionIdMatch = question.id.match(/^(\d+\.\d+)/);
  const questionNumber = questionIdMatch ? questionIdMatch[1] : question.id;
  
  // Add explanation from our predefined list if available, otherwise use the local function
  const explanation = anchorQuestion?.explanation || getQuestionExplanation(question.id);
  
  // Format the question in the exact format expected by the system prompt
  let formattedQuestion = `**Why we're asking ${questionNumber}:** ${explanation}\n\n`;
  formattedQuestion += `**Actual Question (${questionNumber}):** ${questionText}\n\n`;
  
  // Format options in the expected format
  if (question.options && question.options.length > 0) {
    formattedQuestion += `Available options: ${question.options.join(' | ')}`;
  }
  
  // Add guidance for answering
  formattedQuestion += `\n\nPlease type your answer exactly as required.`;
  
  // Add information about image attachments for specific questions
  if (requiresImageAttachment(question.id)) {
    formattedQuestion += `\n\n**Note:** This question requires visual documentation. Please upload data flow diagrams showing how information moves through your initiative.`;
  }
  
  return formattedQuestion;
}

/**
 * Check if a question requires image attachments
 */
export function requiresImageAttachment(questionId: string): boolean {
  // Check if the question ID starts with "2.1" which is the data flow diagram question
  // This makes the function more robust to variations in how the question ID is formatted
  if (questionId.startsWith("2.1")) {
    return true;
  }
  
  // List of question IDs that require image attachments (for backward compatibility)
  const questionsRequiringImages = [
    "2.1 Provide a data flow for the initiative (Single selection allowed) (Allows other) *",
    "2.1: Attach and describe the main data flow for storage and processing in this initiative"
  ];
  
  return questionsRequiringImages.includes(questionId);
}

/**
 * Get explanation for a specific question
 */
function getQuestionExplanation(questionId: string): string {
  // Map of question IDs to explanations
  const explanations: Record<string, string> = {
    // Section 1 - Project Information
    "1.1 Description *": "This question asks for a brief overview of your project or initiative. Provide enough detail to give reviewers context about what you're trying to accomplish.",
    "1.2 Director Sponsor *": "Identify the Director who is sponsoring this initiative. This person will be responsible for the ethical oversight of the project.",
    "1.3 Business Area (Multiple selections allowed) (Allows other) *": "Select all business areas involved in or affected by this initiative. This helps identify stakeholders and applicable policies.",
    "1.4 Could you indicate which part of TELUS Health this pertains to? (Multiple selections allowed) *": "If this initiative involves TELUS Health, specify which divisions or components are involved.",
    "1.5 Please provide a valid project funding code *": "The funding code helps track resources allocated to this initiative and ensures proper accounting.",
    "1.6 What is the target date to go-live for this initiative? (Import expects YYYY-MM-DD format) *": "Provide the expected launch date in YYYY-MM-DD format. This helps with planning and compliance timelines.",
    
    // Section 2 - Data and Scope
    "2.1 Provide a data flow for the initiative (Single selection allowed) (Allows other) *": "Describe how data moves through your initiative. This helps identify potential privacy or security concerns.",
    "2.2 Select all that are applicable for this initiative:  (Multiple selections allowed) *": "Identify the types of activities involved in your initiative to determine applicable regulations and requirements.",
    "2.3 Who is the customer? (Multiple selections allowed) (Allows other) *": "Specify who will be using or benefiting from this initiative. This affects privacy, consent, and other requirements.",
    "2.4 Select the type of data in scope for your initiative *": "Identify all types of data that will be collected, processed, or stored as part of this initiative.",
    "2.5 Is there any other data in scope? (Single selection allowed) *": "Indicate if there are additional data types not covered in the previous question.",
    "2.6 Is personal information in scope for this initiative? (Single selection allowed) *": "Personal information includes any data that can identify an individual. This is critical for privacy compliance.",
    
    // Default explanation for other questions
    "default": "This question helps assess the ethical and privacy implications of your initiative. Please provide accurate information to ensure proper evaluation."
  };
  
  return explanations[questionId] || explanations["default"];
}

/**
 * Get guidance for answering a specific question
 */
function getAnswerGuidance(questionId: string): string {
  // Map of question IDs to answer guidance
  const guidance: Record<string, string> = {
    "2.6 Is personal information in scope for this initiative? (Single selection allowed) *": "Consider whether your initiative collects, uses, or discloses any information that could identify an individual, either directly or indirectly.",
    "default": "Be specific and provide factual information rather than opinions."
  };
  
  return guidance[questionId] || guidance["default"];
}

/**
 * Get sample answer for a specific question
 */
function getSampleAnswer(questionId: string): string | null {
  // Map of question IDs to sample answers
  const sampleAnswers: Record<string, string> = {
    "1.1 Description *": "Customer Experience Enhancement Platform - A system to analyze customer feedback and improve service delivery across digital channels.",
    "1.5 Please provide a valid project funding code *": "PRJ-2025-CX-0042",
    "1.6 What is the target date to go-live for this initiative? (Import expects YYYY-MM-DD format) *": "2025-08-15",
    "2.6 Is personal information in scope for this initiative? (Single selection allowed) *": "Yes - The initiative will process customer contact information and service history to provide personalized recommendations."
  };
  
  return questionId in sampleAnswers ? sampleAnswers[questionId] : null;
}
