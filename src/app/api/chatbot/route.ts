import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory storage for conversations
// In a real application, you would use a database
const conversations: Record<string, Array<{ role: string; content: string }>> = {};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationId } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Generate or use existing conversation ID
    const currentConversationId = conversationId || Date.now().toString();
    
    // Initialize conversation if it doesn't exist
    if (!conversations[currentConversationId]) {
      conversations[currentConversationId] = [];
    }
    
    // Add user message to conversation
    conversations[currentConversationId].push({
      role: 'user',
      content: message,
    });

    // In a real application, you would call an AI service here
    // For now, we'll just use a simple response
    const botResponse = generateSimpleResponse(message);
    
    // Add bot response to conversation
    conversations[currentConversationId].push({
      role: 'assistant',
      content: botResponse,
    });

    // Return the response
    return NextResponse.json({
      message: botResponse,
      conversationId: currentConversationId,
    });
  } catch (error) {
    console.error('Error processing chatbot request:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

// Simple response generator
function generateSimpleResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return 'Hello! How can I help you today?';
  }
  
  if (lowerMessage.includes('help')) {
    return 'I can help you with information about TELUS services, troubleshooting, and more. What do you need assistance with?';
  }
  
  if (lowerMessage.includes('thank')) {
    return "You're welcome! Is there anything else I can help you with?";
  }
  
  if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
    return 'Goodbye! Have a great day!';
  }
  
  if (lowerMessage.includes('telus')) {
    return 'TELUS is a Canadian telecommunications company that provides a wide range of services including mobile, internet, TV, and smart home security.';
  }
  
  // Default response
  return "I'm your TELUS assistant. I'm still learning, but I'm here to help with any questions you might have about TELUS services.";
}

// GET endpoint for retrieving conversation history
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json(
      { error: 'Conversation ID is required' },
      { status: 400 }
    );
  }
  
  const conversation = conversations[id];
  
  if (!conversation) {
    return NextResponse.json(
      { error: 'Conversation not found' },
      { status: 404 }
    );
  }
  
  // Format the conversation for the client
  const messages = conversation.map(msg => ({
    content: msg.content,
    type: msg.role === 'user' ? 'user' : 'bot',
  }));
  
  return NextResponse.json({ messages });
}
