/**
 * Chatbot API utilities
 * This file contains functions for interacting with the chatbot API
 */

export interface ChatResponse {
  message: string;
  conversationId?: string;
}

/**
 * Send a message to the chatbot API
 * @param message The user's message
 * @param conversationId Optional conversation ID for continuing a conversation
 * @returns Promise with the chatbot's response
 */
export async function sendMessage(
  message: string,
  conversationId?: string
): Promise<ChatResponse> {
  try {
    const response = await fetch('/api/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationId,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending message to chatbot API:', error);
    throw error;
  }
}

/**
 * Get conversation history
 * @param conversationId The conversation ID
 * @returns Promise with the conversation history
 */
export async function getConversationHistory(
  conversationId: string
): Promise<{ messages: Array<{ content: string; type: 'user' | 'bot' }> }> {
  try {
    const response = await fetch(`/api/chatbot/history?id=${conversationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    throw error;
  }
}
