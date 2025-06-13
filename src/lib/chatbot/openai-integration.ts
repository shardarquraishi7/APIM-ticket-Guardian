// This is an example implementation of OpenAI integration for the chatbot

// First, install the OpenAI SDK:
// npm install openai

import OpenAI from 'openai';

// Initialize the OpenAI client
// You'll need to add your API key to the .env or .env.local file
// OPENAI_API_KEY=your_api_key_here
// OPENAI_BASE_URL=https://your-proxy-url (optional)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL, // Optional: Use a proxy or alternative base URL
});

// Define the system message that sets the behavior of the assistant
const SYSTEM_MESSAGE = {
  role: 'system',
  content: `You are a helpful TELUS assistant. 
  You provide information about TELUS services, help with troubleshooting, and answer customer questions.
  Be friendly, concise, and helpful. If you don't know the answer to a question, be honest about it.
  Always maintain a professional tone consistent with TELUS brand voice.`
};

// Interface for conversation messages
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Generates a response using OpenAI's API
 * @param message The user's message
 * @param conversationHistory Previous messages in the conversation
 * @returns The AI-generated response
 */
export async function generateAIResponse(
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  try {
    // Import the knowledge base functions dynamically to avoid circular dependencies
    const { getRelevantInformation } = await import('./knowledge-base');
    
    // Get relevant information from the knowledge base
    let relevantInfo = '';
    try {
      relevantInfo = await getRelevantInformation(message);
    } catch (kbError) {
      console.error('Error retrieving information from knowledge base:', kbError);
      // Continue without knowledge base information if there's an error
    }
    
    // Create a modified system message that includes relevant information
    const enhancedSystemMessage = {
      role: 'system',
      content: `${SYSTEM_MESSAGE.content}
      
${relevantInfo ? `Here is some relevant information to help answer the user's question:
${relevantInfo}

Use the information above to answer the user's question. If the information doesn't fully address the question, you can provide general information about TELUS services, but make it clear which parts are from the knowledge base and which are general information.` : ''}`,
    };
    
    // Prepare the messages array with the enhanced system message first
    const messages = [
      enhancedSystemMessage,
      ...conversationHistory,
      { role: 'user', content: message } as ChatMessage
    ];

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4', // You can use 'gpt-3.5-turbo' for a more cost-effective option
      messages: messages as any, // Type assertion needed due to OpenAI types
      temperature: 0.7, // Controls randomness: lower is more deterministic
      max_tokens: 500, // Limit the response length
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // Extract and return the response text
    return response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return "I'm sorry, I encountered an error while processing your request.";
  }
}

/**
 * Extracts entities and intents from a user message
 * This can be used for more advanced routing and handling
 * @param message The user's message
 * @returns Extracted entities and intents
 */
export async function analyzeMessage(message: string) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Extract the following information from the user message:
          1. Intent (e.g., question, complaint, request)
          2. Topic (e.g., internet, mobile, TV, billing)
          3. Entities (e.g., specific products, services, or issues mentioned)
          
          Return the information in JSON format with the keys: intent, topic, entities`
        },
        { role: 'user', content: message }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    return content ? JSON.parse(content) : null;
  } catch (error) {
    console.error('Error analyzing message:', error);
    return null;
  }
}
