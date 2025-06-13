'use client';

import React from 'react';

export type MessageType = 'user' | 'bot';

export interface ChatMessageProps {
  content: string;
  type: MessageType;
  timestamp?: Date;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ content, type, timestamp = new Date() }) => {
  const isUser = type === 'user';
  
  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser 
            ? 'bg-telus-purple text-white rounded-tr-none' 
            : 'bg-gray-100 text-gray-800 rounded-tl-none'
        }`}
      >
        <div className="text-sm">{content}</div>
        <div className={`text-xs mt-1 ${isUser ? 'text-gray-200' : 'text-gray-500'}`}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
