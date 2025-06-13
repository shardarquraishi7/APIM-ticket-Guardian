import { createLogger } from '@/lib/logger';
import { Question, AnswerMap, Section, QuestionPrompt } from '@/types';
import { getSectionFromId } from '@/services/section-service';
import { 
  questions, 
  anchorQuestions, 
  getQuestionById
} from '@/ai/prompts/questions';
import { applyAllInferenceRules } from '@/ai/prompts/inference-rules';
import { getDefaultAnswer, hasDefaultAnswer } from '@/data/default-answers';
import { QuestionData } from '@/services/xlsx/xlsx-service';
import { SKIPPED_ANSWER } from '@/constants';
import { ANCHORS, anchorQuestionPrompts, getAnchorPromptById } from '@/data/questions';

const logger = createLogger('question-service');

/**
 * Service for handling DEP questions and answers
 */
export class QuestionService {
  /**
   * Collects anchor answers, applies all inference rules,
   * and returns a complete AnswerMap with answers for all questions.
   * No question will be left unanswered.
   * 
   * @param existingAnswers - Map of existing answers
   * @param allQuestionIds - Array of all question IDs that need answers
   * @returns Object containing answers map and metadata
   */
  async predictAnswers(
    existingAnswers: AnswerMap = {},
    allQuestionIds: string[] = []
  ): Promise<{ answers: AnswerMap, metadata: Record<string, { merged?: boolean, skipped?: boolean, defaulted?: boolean }> }> {
    // Create a metadata map to track special answer states
    const metadata: Record<string, { merged?: boolean, skipped?: boolean, defaulted?: boolean }> = {};
    
    // 1. Ask all anchors in the exact order specified in the requirements
    // This ensures we follow the sequence: 2.6, 2.7, 13.1, 9.1, 7.1, 7.3, SECTION_REGIMES
    for (const anchorPrompt of anchorQuestionPrompts) {
      // Find the corresponding Question object from the questions array
      const anchor = getQuestionById(anchorPrompt.id);
      
      if (!anchor) {
        logger.warn(`Could not find question definition for anchor ${anchorPrompt.id}`);
        continue;
      }
      
      if (existingAnswers[anchor.id] === undefined) {
        try {
          // Use our enhanced promptUser method which will use the anchorPrompt
          // Pass the current existingAnswers to show how many questions are already answered
          existingAnswers[anchor.id] = await this.promptUser(anchor, existingAnswers);
          logger.info(`User provided answer for ${anchor.id}: ${existingAnswers[anchor.id]}`);
        } catch (error) {
          // Log the error but continue with other anchors
          logger.error(`Error prompting for anchor ${anchor.id}:`, error);
          // Mark this anchor as skipped in metadata
          metadata[anchor.id] = { skipped: true };
          // We don't set it to undefined as that would violate the type
          // Instead, we'll use a placeholder that downstream inferences can detect
          existingAnswers[anchor.id] = SKIPPED_ANSWER;
        }
      }
    }

    // 2. Apply comprehensive inference rules
    logger.info(`Applying comprehensive inference rules to ${Object.keys(existingAnswers).length} anchor answers`);
    
    // Use our new comprehensive inference rules
    const inferredAnswers = applyAllInferenceRules(existingAnswers);
    
    // Track which answers were inferred
    for (const [id, answer] of Object.entries(inferredAnswers)) {
      if (existingAnswers[id] === undefined) {
        // This is a newly inferred answer
        existingAnswers[id] = answer;
      }
    }
    
    logger.info(`After applying inference rules, ${Object.keys(existingAnswers).length} questions have answers`);

    // 3. Fill in any remaining unanswered questions with default values from our comprehensive default answers map
    logger.info(`After inference, ${Object.keys(existingAnswers).length} questions have answers. Filling in defaults for remaining questions.`);
    
    // Use the provided question IDs if available, otherwise fall back to the questions array
    const questionIdsToFill = allQuestionIds.length > 0 ? 
      allQuestionIds : 
      questions.map(q => q.id);
    
    // Fill in defaults for all question IDs
    for (const questionId of questionIdsToFill) {
      if (existingAnswers[questionId] === undefined) {
        // Use our default answers map
        if (hasDefaultAnswer(questionId)) {
          existingAnswers[questionId] = getDefaultAnswer(questionId);
          logger.debug(`Using default answer for ${questionId}: ${existingAnswers[questionId]}`);
        } else {
          // Fallback for any question IDs not in our default answers map
          logger.warn(`No default answer found for question ${questionId}, using "Not Applicable"`);
          existingAnswers[questionId] = "Not Applicable";
        }
        
        // Mark as defaulted in metadata
        metadata[questionId] = { ...metadata[questionId], defaulted: true };
      }
    }
    
    // Verify that all questions have answers
    const unansweredQuestions = questionIdsToFill.filter(id => existingAnswers[id] === undefined);
    if (unansweredQuestions.length > 0) {
      const errorMsg = `Failed to provide answers for ${unansweredQuestions.length} questions: ${unansweredQuestions.join(', ')}`;
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    logger.info(`Prediction complete. All ${questionIdsToFill.length} questions now have answers.`);

    // 4. Return the complete map and metadata
    return { answers: existingAnswers, metadata };
  }

  /**
   * Class properties to track the total number of questions and allowed options
   * These would be set when the DEP file is loaded
   */
  private totalQuestions: number = 0;
  private allowedOptions: Record<string, string[]> = {};

  /**
   * Set the total number of questions
   * @param count - The total number of questions in the DEP file
   */
  setTotalQuestions(count: number): void {
    this.totalQuestions = count;
    logger.info(`Set total questions count to ${count}`);
  }

  /**
   * Set the allowed options for each question
   * @param options - Record mapping question IDs to their allowed options
   */
  setAllowedOptions(options: Record<string, string[]>): void {
    this.allowedOptions = options;
    logger.info(`Set allowed options for ${Object.keys(options).length} questions`);
    
    // Log a sample of the options for debugging
    const sampleKeys = Object.keys(options).slice(0, 3);
    for (const key of sampleKeys) {
      logger.debug(`Sample options for ${key}: ${options[key].join(', ')}`);
    }
  }

  /** 
   * Presents an enhanced prompt to the user with context and the exact question text.
   * @param q - The question to prompt for
   * @param existingAnswers - Optional map of existing answers to determine how many are already answered
   * @returns The user's answer
   */
  private async promptUser(q: Question, existingAnswers: AnswerMap = {}): Promise<string> {
    try {
      // Get the enhanced prompt for this question if it's an anchor
      const enhancedPrompt = getAnchorPromptById(q.id);
      
      if (!enhancedPrompt) {
        logger.warn(`No enhanced prompt found for question ${q.id}, using basic prompt`);
        // Fall back to basic prompt if no enhanced prompt is available
        return this.basicPromptUser(q);
      }
      
      // Build a comprehensive prompt with context
      const totalQuestions = this.totalQuestions || questions.length;
      const answeredQuestions = Object.keys(existingAnswers).length;
      
      // Format the question text to ensure it's fully visible
      // Add proper padding and line breaks for readability
      const formattedQuestionText = enhancedPrompt.questionText
        .split(/(?<=\?|\*|\.)(?=\s|$)/) // Split after question marks, asterisks, or periods followed by space or end
        .join('\n') // Join with newlines for better readability
        .trim();
      
      // Get allowed options from Excel if available, otherwise use the ones from the prompt
      const questionOptions = this.allowedOptions[q.id] || 
                             this.allowedOptions[enhancedPrompt.id] || 
                             enhancedPrompt.options || 
                             [];
      
      const optionsText = questionOptions.length > 0 
        ? `Available options: ${questionOptions.join(' | ')}`
        : 'Free text response';
      
      const fullPrompt = [
        `I've analyzed your DEP file and found ${totalQuestions} questions, ${answeredQuestions} already answered.`,
        ``,
        `**Why we're asking ${enhancedPrompt.id}:** ${enhancedPrompt.context}`,
        ``,
        `**Actual Question (${enhancedPrompt.id}):**`,
        `${formattedQuestionText}`,
        ``,
        `${optionsText}`,
        ``,
        `Please type your answer exactly as required.`
      ].join("\n");
      
      // Log that we're using the enhanced prompt
      logger.info(`Prompting user for anchor question ${q.id} with enhanced context`);
      logger.debug(fullPrompt);
      
      // Set a timeout to simulate potential network issues or user cancellation
      const response = await Promise.race([
        // The actual prompt logic - return the full prompt to the caller
        // This allows the UI to display the prompt and get the user's response
        (async () => {
          // Return the full prompt to be displayed to the user
          // The caller will handle showing this to the user and getting their response
          return fullPrompt;
        })(),
        
        // Timeout after 30 seconds
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Prompt timeout')), 30000);
        })
      ]);
      
      return response;
    } catch (error: any) {
      // Log the error but don't crash the application
      logger.error(`Error prompting user for question ${q.id}:`, error);
      
      // Return undefined to indicate the prompt failed
      // The calling code should handle this gracefully
      throw new Error(`Failed to get answer for question ${q.id}: ${error.message}`);
    }
  }
  
  /**
   * Basic prompt implementation for non-anchor questions
   * @param q - The question to prompt for
   * @returns The user's answer
   */
  private async basicPromptUser(q: Question): Promise<string> {
    try {
      // Get allowed options from Excel if available, otherwise use the ones from the question
      const questionOptions = this.allowedOptions[q.id] || q.options || [];
      
      // Create a basic prompt for non-anchor questions
      const optionsText = questionOptions.length > 0 
        ? `Options: ${questionOptions.join(' | ')}`
        : 'Free text response';
      
      const fullPrompt = `Question ${q.id}: ${q.text}\n\n${optionsText}`;
      
      logger.info(`Basic prompt for question ${q.id}: ${q.text}`);
      
      // Use the chat interface to ask the user for an answer
      // This will be implemented by the UI component that receives the prompt
      return fullPrompt;
    } catch (error: any) {
      logger.error(`Error in basic prompt for question ${q.id}:`, error);
      throw new Error(`Failed to get answer for question ${q.id}: ${error.message}`);
    }
  }

  /**
   * Find the next unanswered anchor question
   * @param questions - All questions from the DEP file
   * @returns The next unanswered anchor question, or undefined if all anchors are answered
   */
  private findNextUnansweredAnchor(questions: QuestionData[]): QuestionData | undefined {
    // Filter to questions that don't have answers
    const unansweredQuestions = questions.filter(q => !q.answer || q.answer.trim() === '');
    
    // Process each anchor in the order they appear in the ANCHORS array
    for (const anchorId of ANCHORS) {
      // Find the matching question in the Excel file
      const matchingQuestion = unansweredQuestions.find(q => {
        // For numeric question IDs (e.g., "2.6")
        if (anchorId.match(/^\d+\.\d+$/)) {
          // Extract just the question number (e.g., "2.6" from "2.6 Is personal information in scope?")
          const questionIdMatch = q.id.match(/^(\d+\.\d+)/);
          const questionId = questionIdMatch ? questionIdMatch[1] : q.id;
          return questionId === anchorId;
        }
        // For special case SECTION_REGIMES
        else if (anchorId === "SECTION_REGIMES") {
          // Look for questions related to regulatory regimes
          return q.id.includes("SECTION_REGIMES") || 
                (q.id.match(/^10\./) && q.question.toLowerCase().includes("quebec")) ||
                (q.id.match(/^11\./) && q.question.toLowerCase().includes("gdpr")) ||
                (q.id.match(/^12\./) && q.question.toLowerCase().includes("hipaa"));
        }
        return false;
      });
      
      if (matchingQuestion) {
        // Found an unanswered anchor question
        logger.info(`Found next unanswered anchor question: ${matchingQuestion.id}`);
        return matchingQuestion;
      }
    }
    
    // No unanswered anchor questions found
    logger.info('No more unanswered anchor questions found');
    return undefined;
  }

  /**
   * Select anchor questions from the full list of questions
   * Uses a predefined list of 7 high-impact anchor questions
   * 
   * @param questions - All questions from the DEP file
   * @param existingAnswers - Map of existing answers
   * @param maxQuestions - Maximum number of questions to select (defaults to 7)
   * @returns Array of selected anchor questions
   */
  selectAnchorQuestions(
    questions: QuestionData[],
    existingAnswers: Map<string, string> | [string, string][],
    maxQuestions: number = 7
  ): QuestionData[] {
    try {
      logger.info(`Selecting up to ${maxQuestions} anchor questions from ${questions.length} total questions`);
      
      // Convert to Map if it's an array
      const answersMap = existingAnswers instanceof Map ? 
        existingAnswers : new Map(existingAnswers);
      
      // Filter out questions that already have answers
      const unansweredQuestions = questions.filter(q => !answersMap.has(q.id) && (!q.answer || q.answer.trim() === ''));
      logger.info(`Found ${unansweredQuestions.length} unanswered questions`);
      
      // If all questions are answered, return empty array
      if (unansweredQuestions.length === 0) {
        return [];
      }
      
      // Create a map to store the selected anchor questions
      const selectedAnchors: QuestionData[] = [];
      
      // Process each anchor in the order they appear in the ANCHORS array
      for (const anchorId of ANCHORS) {
        // Find the matching question in the Excel file
        const matchingQuestion = unansweredQuestions.find(q => {
          // For numeric question IDs (e.g., "2.6")
          if (anchorId.match(/^\d+\.\d+$/)) {
            // Extract just the question number (e.g., "2.6" from "2.6 Is personal information in scope?")
            const questionIdMatch = q.id.match(/^(\d+\.\d+)/);
            const questionId = questionIdMatch ? questionIdMatch[1] : q.id;
            return questionId === anchorId;
          }
          // For special case SECTION_REGIMES
          else if (anchorId === "SECTION_REGIMES") {
            // Look for questions related to regulatory regimes
            return q.id.includes("SECTION_REGIMES") || 
                  (q.id.match(/^10\./) && q.question.toLowerCase().includes("quebec")) ||
                  (q.id.match(/^11\./) && q.question.toLowerCase().includes("gdpr")) ||
                  (q.id.match(/^12\./) && q.question.toLowerCase().includes("hipaa"));
          }
          return false;
        });
        
        if (matchingQuestion) {
          selectedAnchors.push(matchingQuestion);
          
          // Log the match for debugging
          logger.info(`Selected anchor question ${matchingQuestion.id} for anchor ${anchorId}`);
        } else {
          logger.warn(`Could not find matching question for anchor ${anchorId}`);
        }
      }
      
      logger.info(`Found ${selectedAnchors.length} anchor questions from predefined list`);
      
      // Cap at maxQuestions
      const finalSelectedAnchors = selectedAnchors.slice(0, maxQuestions);
      
      logger.info(`Selected ${finalSelectedAnchors.length} anchor questions in total`);
      return finalSelectedAnchors;
    } catch (error: any) {
      logger.error('Error selecting anchor questions:', error);
      throw new Error(`Failed to select anchor questions: ${error.message}`);
    }
  }

  /**
   * Predict answers for all questions based on anchor answers
   * @param questions - All questions from the DEP file
   * @param anchorAnswers - Map or array of anchor question IDs to their answers
   * @returns Object containing predicted questions, answers, metadata, and the next prompt
   */
  async predictFromAnchors(
    questions: QuestionData[],
    anchorAnswers: Map<string, string> | [string, string][]
  ): Promise<{
    predictedQuestions: QuestionData[];
    answers: AnswerMap;
    metadata: Record<string, { merged?: boolean; skipped?: boolean; defaulted?: boolean }>;
    nextPrompt: string;
  }> {
    try {
      // Convert to Map if it's an array
      const answerMap = anchorAnswers instanceof Map ? 
        anchorAnswers : new Map(anchorAnswers);
      
      // Set the total questions count for use in the promptUser method
      this.setTotalQuestions(questions.length);
      
      logger.info(`Predicting answers for ${questions.length} questions based on ${answerMap.size} anchor answers`);
      
      // Create a copy of the questions to avoid modifying the original
      const predictedQuestions = [...questions];
      
      // Convert answerMap to AnswerMap format for our inference engine
      const typedAnswers: AnswerMap = {};
      answerMap.forEach((value, key) => {
        typedAnswers[key] = value;
      });
      
      // Extract all question IDs from the questions array
      const allQuestionIds = predictedQuestions.map(q => q.id);
      
      // Use our new predictAnswers method to get all answers (including inferred ones)
      // This is an async method, so we need to await it
      const { answers: allAnswers, metadata } = await this.predictAnswers(typedAnswers, allQuestionIds);
      
      // Apply all answers to our questions
      for (const [id, answer] of Object.entries(allAnswers)) {
        const questionIndex = predictedQuestions.findIndex(q => q.id === id);
        if (questionIndex !== -1) {
          // Determine confidence level based on source and metadata
          let confidence = 0.5; // Default confidence
          
          if (answerMap.has(id)) {
            // User-provided anchor answer
            confidence = 1.0;
          } else if (answer === SKIPPED_ANSWER) {
            // Skipped anchor - mark with very low confidence
            confidence = 0.1;
          } else if (answer === "Not Applicable") {
            // Not Applicable answers from direct anchor inference
            confidence = 0.9;
          } else if (metadata[id]?.merged) {
            // Merged multi-select answers get slightly lower confidence
            confidence = 0.6;
          } else if (metadata[id]?.defaulted) {
            // Default answers - lowest confidence
            confidence = 0.2;
          } else {
            // Regular inferred answers from cascading rules
            confidence = 0.7;
          }
          
          // Convert array answers to string if needed for UI display
          // Note: In a future version, we could preserve the array type and let the UI handle formatting
          const formattedAnswer = Array.isArray(answer) ? answer.join(', ') : answer;
          
          predictedQuestions[questionIndex] = {
            ...predictedQuestions[questionIndex],
            answer: formattedAnswer,
            confidence,
            metadata: {
              ...(metadata[id] || {}),
              source: answerMap.has(id) ? 'user' : 
                      answer === SKIPPED_ANSWER ? 'skipped' : 
                      answer === "Not Applicable" ? 'inference-direct' : 
                      metadata[id]?.defaulted ? 'default' :
                      metadata[id]?.merged ? 'inference-merged' : 'inference'
            }
          };
        }
      }
      
      logger.info(`Prediction complete. ${predictedQuestions.filter(q => q.answer && q.answer.trim() !== '').length} questions now have answers`);
      
      // Find the next unanswered anchor question
      const nextAnchorToAsk = this.findNextUnansweredAnchor(predictedQuestions);
      let nextPrompt = '';
      
      if (nextAnchorToAsk) {
        // Find the corresponding Question object
        const anchor = getQuestionById(nextAnchorToAsk.id);
        if (anchor) {
          // Generate the full prompt for this anchor
          try {
            nextPrompt = await this.promptUser(anchor, typedAnswers);
            logger.info(`Generated next prompt for anchor question ${nextAnchorToAsk.id}`);
          } catch (error: any) {
            logger.error(`Error generating prompt for next anchor ${nextAnchorToAsk.id}:`, error);
            nextPrompt = `Error generating prompt for ${nextAnchorToAsk.id}: ${error.message}`;
          }
        }
      }
      
      return {
        predictedQuestions,
        answers: allAnswers,
        metadata,
        nextPrompt
      };
    } catch (error: any) {
      logger.error('Error predicting answers:', error);
      throw new Error(`Failed to predict answers: ${error.message}`);
    }
  }
}

// Export a singleton instance
export const questionService = new QuestionService();
