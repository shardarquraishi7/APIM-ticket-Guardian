'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useUser } from '@/components/OAuthWrapper';
import ChatContainer, { Message } from '@/components/chatbot/ChatContainer';
import { sendMessage } from '@/lib/chatbot/api';

export default function ChatbotPage() {
  const user = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hello${user?.name ? ` ${user.name}` : ''}! I'm your TELUS assistant. How can I help you today?`,
      type: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  
  // Handle sending a message to the chatbot API
  const handleSendMessage = useCallback(async (content: string) => {
    setIsLoading(true);
    
    try {
      const response = await sendMessage(content, conversationId);
      
      // Add bot response to messages
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: response.message,
          type: 'bot',
          timestamp: new Date(),
        },
      ]);
      
      // Save conversation ID if it's new
      if (response.conversationId && !conversationId) {
        setConversationId(response.conversationId);
      }
    } catch (error) {
      console.error('Error in chat:', error);
      
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: 'Sorry, there was an error processing your message. Please try again.',
          type: 'bot',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-telus-purple mb-6">TELUS Chatbot</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">About this Chatbot</h2>
          <p className="mb-4">
            This is a simple chatbot implementation for the Next.js Cloudflare Workers Starter Kit.
            It demonstrates how to build a chatbot interface with Next.js and React.
          </p>
          <p>
            In a real application, you would integrate with an AI service like OpenAI, Azure OpenAI,
            or another AI provider to generate more intelligent responses.
          </p>
        </div>
        
        <div className="h-[600px] mb-6">
          <ChatContainer
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            className="h-full"
          />
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg text-sm text-gray-600">
          <p>
            <strong>Note:</strong> This chatbot uses a simple rule-based response system for demonstration purposes.
            It stores conversations in memory, which means they will be lost when the server restarts.
            In a production environment, you would use a database to store conversations and integrate with an AI service.
          </p>
        </div>
      </div>
    </div>
  );
}
