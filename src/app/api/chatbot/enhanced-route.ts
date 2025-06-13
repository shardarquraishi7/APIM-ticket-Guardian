import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse, analyzeMessage, ChatMessage } from '@/lib/chatbot/openai-integration';
import { getRelevantInformation, initializeKnowledgeBase } from '@/lib/chatbot/knowledge-base';
import { db } from '@/lib/database/db';

// Initialize the knowledge base when the module is loaded
initializeKnowledgeBase().catch(error => {
  console.error('Failed to initialize knowledge base:', error);
});

// This is an enhanced version of the chatbot API route that uses OpenAI integration
// To use this, rename this file to route.ts after installing the OpenAI SDK

// Example schema for the database (add this to your database/schema.sql file)
/*
CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chatbot_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES chatbot_conversations (id) ON DELETE CASCADE
);
*/

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
    
    // Get conversation history from database
    let conversationHistory: ChatMessage[] = [];
    
    try {
      // If using Cloudflare D1 database
      if (db) {
        // Create conversation if it doesn't exist
        if (!conversationId) {
          await db.prepare(
            'INSERT INTO chatbot_conversations (id) VALUES (?)'
          ).bind(currentConversationId).run();
        }
        
        // Get existing messages
        const { results } = await db.prepare(
          'SELECT role, content FROM chatbot_messages WHERE conversation_id = ? ORDER BY created_at ASC'
        ).bind(currentConversationId).all();
        
        if (results && Array.isArray(results)) {
          conversationHistory = results as ChatMessage[];
        }
        
        // Add user message to database
        await db.prepare(
          'INSERT INTO chatbot_messages (conversation_id, role, content) VALUES (?, ?, ?)'
        ).bind(currentConversationId, 'user', message).run();
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue with in-memory fallback if database fails
    }
    
    // Add user message to conversation history
    conversationHistory.push({
      role: 'user',
      content: message
    });

    // Optional: Analyze the message for intent and entities
    // This can be used for more advanced routing or handling
    const analysis = await analyzeMessage(message);
    console.log('Message analysis:', analysis);
    
    // Generate response using OpenAI
    const botResponse = await generateAIResponse(message, conversationHistory);
    
    // Add bot response to database
    try {
      if (db) {
        await db.prepare(
          'INSERT INTO chatbot_messages (conversation_id, role, content) VALUES (?, ?, ?)'
        ).bind(currentConversationId, 'assistant', botResponse).run();
      }
    } catch (dbError) {
      console.error('Database error when saving response:', dbError);
    }

    // Return the response
    return NextResponse.json({
      message: botResponse,
      conversationId: currentConversationId,
      analysis: analysis // Optional: Include the analysis in the response
    });
  } catch (error) {
    console.error('Error processing chatbot request:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
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
  
  try {
    if (db) {
      // Get messages from database
      const { results } = await db.prepare(
        'SELECT role, content, created_at FROM chatbot_messages WHERE conversation_id = ? ORDER BY created_at ASC'
      ).bind(id).all();
      
      if (!results || !Array.isArray(results) || results.length === 0) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }
      
      // Format the conversation for the client
      const messages = results.map(msg => ({
        content: msg.content,
        type: msg.role === 'user' ? 'user' : 'bot',
        timestamp: new Date(msg.created_at)
      }));
      
      return NextResponse.json({ messages });
    } else {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error retrieving conversation:', error);
    return NextResponse.json(
      { error: 'An error occurred while retrieving the conversation' },
      { status: 500 }
    );
  }
}
