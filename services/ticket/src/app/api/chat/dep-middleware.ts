import { createLogger } from '@/lib/logger';
import { openai } from '@/lib/openai';
import { CHAT_MODEL } from '@/constants';
import { streamText } from 'ai';
import { anchorQuestions, questionBank, optionBank, sectionRelationships } from '@/ai/prompts/depQuestionsData';

const logger = createLogger('dep-middleware');

/**
 * Middleware for handling DEP-related questions in the chat API
 */
export class DEPMiddleware {
  // Flag to track if the message is a general DEP question
  private isGeneralDepQuestion: boolean = false;
  
  /**
   * Get whether the message is a general DEP question
   * @returns Whether the message is a general DEP question
   */
  getIsGeneralDepQuestion(): boolean {
    return this.isGeneralDepQuestion;
  }
  /**
   * Check if a message is related to DEP
   * @param message - The user's message
   * @returns Whether the message is related to DEP
   */
  isDepRelated(message: string): boolean {
    // Keywords that indicate a request to process a DEP file
    const depFileKeywords = [
      'upload DEP', 'process DEP file', 'analyze DEP', 'fill DEP',
      'complete questionnaire', 'fill out questionnaire', 'upload xlsx',
      'upload excel', 'process excel', 'anchor questions'
    ];
    
    // Keywords that indicate a general question about DEP
    const depGeneralKeywords = [
      'DEP', 'Data Ethics Process', 'privacy assessment', 
      'data ethics', 'TELUS privacy'
    ];
    
    const lowerMessage = message.toLowerCase();
    
    // Check if this is a request to process a DEP file
    const isDepFileRequest = depFileKeywords.some(keyword => 
      lowerMessage.includes(keyword.toLowerCase())
    );
    
    // Check if this is a general DEP question
    const isGeneralDepQuestion = depGeneralKeywords.some(keyword => 
      lowerMessage.includes(keyword.toLowerCase())
    );
    
    // Set the flag for use in other methods
    this.isGeneralDepQuestion = isGeneralDepQuestion && !isDepFileRequest;
    
    // Return true for both file requests and general DEP questions
    return isDepFileRequest || this.isGeneralDepQuestion;
  }
  
  /**
   * Process a DEP-related message
   * @param message - The user's message
   * @returns The AI response
   */
  async processDepMessage(message: string): Promise<string> {
    try {
      // Create a system prompt with DEP knowledge
      const systemPrompt = this.createDepSystemPrompt(this.getIsGeneralDepQuestion());
      
      // Add debug logging to see the system prompt
      console.log("===== SYSTEM PROMPT SENT TO OPENAI =====");
      console.log(systemPrompt);
      console.log("========================================");
      
      // Instead of using streamText, use a direct API call to the OpenAI API
      // This ensures we get a clean response without streaming artifacts
      
      // Call the OpenAI API directly
      const completion = await openai.chat.completions.create({
        model: CHAT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });
      
      // Extract the response text from the completion
      const responseText = completion.choices[0]?.message?.content || 
        'I encountered an error while processing your DEP-related question. Please try again or contact support.';
      
      // Add debug logging to see the assistant's response
      console.log("===== ASSISTANT RESPONSE START =====");
      console.log(responseText);
      console.log("===== ASSISTANT RESPONSE END =====");
      
      // Log the response for debugging
      logger.info('Generated DEP response:', responseText);
      
      return responseText;
    } catch (error: any) {
      logger.error('Error processing DEP message:', error);
      return 'I encountered an error while processing your DEP-related question. Please try again or contact support.';
    }
  }
  
  /**
   * Create a system prompt with DEP knowledge
   * @param isGeneralQuestion - Whether this is a general DEP question
   * @returns The system prompt
   */
  private createDepSystemPrompt(isGeneralQuestion: boolean = false): string {
    // Create a summary of anchor questions
    const anchorSummary = anchorQuestions
      .sort((a, b) => (a.priority || 0) - (b.priority || 0))
      .map(a => `Question ${a.id}:\n${a.questionText}\nExplanation: ${a.explanation}\nOptions: ${a.options.join(" | ")}`)
      .join("\n\n");
    
    // Create the system prompt based on whether this is a general question or a file request
    if (isGeneralQuestion) {
      return `
You are DEP Guardian AI, an expert on the Data Ethics Process (DEP) at TELUS. You can answer general questions about the DEP process, privacy assessments, data ethics, and TELUS privacy policies.

You have knowledge of the DEP questionnaire structure, which includes the following key sections:
1. Project Information
2. Data Scope & Classification
3. Data Retention
4. Privacy
5. Personal Health Information
6. Security
7. AI & Machine Learning
8. Cyber Assurance
9. Payment Card Industry
10. Quebec Law 25
11. GDPR
12. HIPAA
13. Vendor Risk

You can explain the purpose of the DEP, how it works, and provide guidance on completing it. You can also answer questions about specific sections or requirements.

If the user wants to actually process a DEP file, you should instruct them to explicitly ask to "upload a DEP file" or "process a DEP questionnaire".
`.trim();
    } else {
      return `
You are DEP Guardian AI. When the user uploads a DEP .xlsx file, follow these steps:

1. Tell them how many questions you found and how many are already answered.
2. Then for the next unanswered anchor question, output exactly:
   • "**Why we're asking [id]:** [explanation]"
   • "**Actual Question ([id]):** [questionText]"
   • "Available options: [options]"
   • "Please type your answer exactly as required."

Here are your seven anchor questions (full text + explanation):

${anchorSummary}
`.trim();
    }
  }
}

// Export a singleton instance
export const depMiddleware = new DEPMiddleware();

/**
 * Handle DEP-related messages in the chat API
 * @param message - The user's message
 * @param chatState - The current chat state
 * @returns The AI response and updated state, or null if not DEP-related
 */
export async function handleDEPMessages(message: any, chatState: any) {
  try {
    // Check if the message is related to DEP
    if (!message.content || !depMiddleware.isDepRelated(message.content)) {
      return null;
    }
    
    logger.info('Processing DEP-related message');
    
    // Process the message - either a general DEP question or a file request
    const response = await depMiddleware.processDepMessage(message.content);
    
    // Update the chat state to indicate this is a DEP conversation
    const updatedState = {
      ...chatState,
      isDEPConversation: true,
      lastDEPInteraction: new Date().toISOString()
    };
    
    // Return the response and updated state
    return {
      message: {
        id: `dep-${Date.now()}`,
        role: 'assistant',
        content: response
      },
      state: updatedState
    };
  } catch (error: any) {
    logger.error('Error handling DEP message:', error);
    return null;
  }
}
