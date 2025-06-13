import { createLogger } from '@/lib/logger';
import { openai } from '@/lib/openai';
import { CHAT_MODEL } from '@/constants';

const logger = createLogger('api-middleware');

/**
 * Middleware for handling API ticketing support in the chat API
 */
export class APIMiddleware {
  // Flag to track if the message is related to API ticketing
  private isAPITicketingRelated: boolean = false;
  
  /**
   * Get whether the message is related to API ticketing
   * @returns Whether the message is related to API ticketing
   */
  getIsAPITicketingRelated(): boolean {
    return this.isAPITicketingRelated;
  }

  /**
   * Check if a message is related to API ticketing
   * @param message - The user's message
   * @returns Whether the message is related to API ticketing
   */
  isTicketingRelated(message: string): boolean {
    // Keywords that indicate a request related to API ticketing
    const apiTicketingKeywords = [
      'api ticket', 'create ticket', 'submit ticket', 'api issue',
      'api error', 'error code', 'status code', 'api documentation',
      'api auth', 'authentication', 'rate limit', 'throttling',
      'api gateway', 'service level', 'sla', 'response time',
      'api endpoint', 'api request', 'api response', 'api key'
    ];
    
    const lowerMessage = message.toLowerCase();
    
    // Check if this is related to API ticketing
    const isTicketingRelated = apiTicketingKeywords.some(keyword => 
      lowerMessage.includes(keyword.toLowerCase())
    );
    
    // Set the flag for use in other methods
    this.isAPITicketingRelated = isTicketingRelated;
    
    return isTicketingRelated;
  }
  
  /**
   * Process an API ticketing related message
   * @param message - The user's message
   * @returns The AI response
   */
  async processTicketingMessage(message: string): Promise<string> {
    try {
      // Create a system prompt with API ticketing knowledge
      const systemPrompt = this.createAPISystemPrompt();
      
      // Add debug logging to see the system prompt
      logger.info("Processing API ticketing message with system prompt");
      
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
        'I encountered an error while processing your API ticketing question. Please try again or contact support.';
      
      // Log the response for debugging
      logger.info('Generated API ticketing response');
      
      return responseText;
    } catch (error: any) {
      logger.error('Error processing API ticketing message:', error);
      return 'I encountered an error while processing your API ticketing question. Please try again or contact support.';
    }
  }
  
  /**
   * Create a system prompt with API ticketing knowledge
   * @returns The system prompt
   */
  private createAPISystemPrompt(): string {
    return `
You are an API Ticketing Support assistant. You help users with:

1. Understanding API documentation and usage
2. Troubleshooting API errors and issues
3. Creating and managing API support tickets
4. Understanding service level agreements (SLAs)

When responding to users:
- Provide clear, concise information about API concepts
- Explain error codes and troubleshooting steps
- Guide users through the ticket creation process
- Explain SLA terms and response time expectations

Always adapt your guidance based on the user's role (Developer, Support Agent, Manager, End User).
`.trim();
  }
}

// Export a singleton instance
export const apiMiddleware = new APIMiddleware();

/**
 * Handle API ticketing related messages in the chat API
 * @param message - The user's message
 * @param chatState - The current chat state
 * @returns The AI response and updated state, or null if not API ticketing related
 */
export async function handleAPIMessages(message: any, chatState: any) {
  try {
    // Check if the message is related to API ticketing
    if (!message.content || !apiMiddleware.isTicketingRelated(message.content)) {
      return null;
    }
    
    logger.info('Processing API ticketing related message');
    
    // Process the message
    const response = await apiMiddleware.processTicketingMessage(message.content);
    
    // Update the chat state to indicate this is an API ticketing conversation
    const updatedState = {
      ...chatState,
      isAPITicketingConversation: true,
      lastAPITicketingInteraction: new Date().toISOString()
    };
    
    // Return the response and updated state
    return {
      message: {
        id: `api-${Date.now()}`,
        role: 'assistant',
        content: response
      },
      state: updatedState
    };
  } catch (error: any) {
    logger.error('Error handling API ticketing message:', error);
    return null;
  }
}
