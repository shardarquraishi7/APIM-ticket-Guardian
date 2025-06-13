'use client';

import { Message } from 'ai';
import { memo } from 'react';
import ReactMarkdown from 'react-markdown';

interface TicketQuestionMessageProps {
  message: Message;
}

function PureTicketQuestionMessage({ message }: TicketQuestionMessageProps) {
  // Extract question information from the message data
  const data = message.data as any;
  const state = data?.state;
  const nextPrompt = data?.nextPrompt;
  
  if (!state || !state.currentQuestionIndex) {
    return null;
  }
  
  // Get the current question
  const currentQuestionIndex = state.currentQuestionIndex;
  const questions = state.anchorQuestions || [];
  const currentQuestion = questions[currentQuestionIndex];
  
  if (!currentQuestion) {
    return null;
  }
  
  // Calculate progress
  const totalQuestions = questions.length;
  const progress = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);
  
  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">API Ticket Question</h3>
        <span className="text-sm text-gray-500">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
        <div 
          className="bg-purple-600 h-2 rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="mt-2 p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
        <p className="font-medium text-gray-800 dark:text-gray-200">{currentQuestion.question}</p>
      </div>
      
      {nextPrompt && (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          <ReactMarkdown>{nextPrompt}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export const TicketQuestionMessage = memo(PureTicketQuestionMessage);
