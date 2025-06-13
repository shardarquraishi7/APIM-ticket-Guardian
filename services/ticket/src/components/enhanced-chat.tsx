'use client';

import { useChat, type Message } from '@ai-sdk/react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatHeader } from '@/components/chat-header';
import { Messages } from './messages';
import { MultimodalInput } from './multimodal-input';
import { ThinkingIndicator } from './thinking-indicator';
import { analyzeQuestionComplexity, getThinkingMessage, ComplexityLevel } from '@/utils/question-complexity';
import { aiResponseConfig } from '@/config/ai-response';
import { logQuestionComplexity, shouldApplyDelay } from '@/utils/analytics';
import { createLogger } from '@/lib/logger';
import { getInformation } from '@/ai/tools/get-information';
import { unableToAnswer } from '@/ai/tools/unable-to-answer';

const logger = createLogger('enhanced-chat');

export function EnhancedChat() {
  // State for DEP conversation
  const [chatState, setChatState] = useState<any>({});

  const { messages, handleSubmit, handleInputChange, input, status, stop, setMessages } = useChat({
    maxSteps: 5,
    sendExtraMessageFields: true,
    body: {
      chatState
    },
    // We're now handling DEP responses directly in the multimodal-input component
  onResponse: async (response) => {
      // We'll keep this simple to avoid Fast Refresh issues
      console.log('onResponse called with response:', response);
      console.log('Response headers:', [...response.headers.entries()]);
      
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (contentType && contentType.includes('application/json')) {
        try {
          // Clone the response before consuming it
          const clonedResponse = response.clone();
          const responseText = await clonedResponse.text();
          console.log('Raw response text:', responseText);
          
          // Parse the JSON
          const data = JSON.parse(responseText);
          console.log('Parsed response data:', data);
          
          // Update chat state
          setChatState(data.state || {});
          console.log('Updated chat state:', data.state);
          
          // Add the message to the chat
          if (data.message) {
            console.log('Adding message to chat:', data.message);
            
            // Create a properly formatted message object
            const newMessage = {
              id: data.message.id || `dep-${Date.now()}`,
              role: data.message.role || 'assistant',
              content: data.message.content || '',
            };
            
            // Add the message to the chat
            setMessages(prevMessages => {
              console.log('Previous messages:', prevMessages);
              const updatedMessages = [...prevMessages, newMessage];
              console.log('Updated messages:', updatedMessages);
              return updatedMessages;
            });
          } else {
            console.warn('No message in response data');
          }
          
          // Signal that we've handled the response without throwing an error
          console.log('Handled the response successfully');
          // We don't need to return anything, just let the function complete normally
          return;
        } catch (error) {
          console.error('Error handling response:', error);
          throw error;
        }
      } else {
        console.log('Response is not JSON, letting default handler process it');
      }
    },
    // Prevent navigation on completion
    onFinish: () => {
      // Do nothing, just prevent default navigation
    }
  });

  // State for complexity-based delay
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState<string | null>(null);
  const [userId] = useState(() => `user-${Math.random().toString(36).substring(2, 9)}`);
  const startTimeRef = useRef<number | null>(null);

  // Enhanced submit handler with complexity analysis and delay
  const enhancedSubmit = useCallback(
    async (event?: { preventDefault?: () => void }, chatRequestOptions?: any) => {
      // Log DEP-related actions for debugging
      if (chatRequestOptions?.data) {
        if (chatRequestOptions.data.type === 'dep-file-upload') {
          console.log('Submitting DEP file upload:', chatRequestOptions.data);
          console.log('Chat request will be sent with:', { messages, chatState, chatRequestOptions });
        } else if (chatRequestOptions.data.type === 'dep-question-answer') {
          console.log('Submitting DEP question answer:', chatRequestOptions.data);
        }
      }
      if (event?.preventDefault) {
        event.preventDefault();
      }

      if (!input.trim()) {
        return;
      }

      // Start timing for analytics
      startTimeRef.current = Date.now();

      // Analyze question complexity
      const complexity = analyzeQuestionComplexity(input);
      logger.info('Question complexity analysis:', complexity);

      // Determine if we should apply a delay for this user
      const applyDelay = shouldApplyDelay(userId);

      if (applyDelay && aiResponseConfig.enableComplexityDelay && complexity.recommendedDelay > 0) {
        // Calculate actual delay based on config
        const actualDelay = Math.min(
          complexity.recommendedDelay * aiResponseConfig.delayMultiplier,
          aiResponseConfig.maxDelay
        );

        // Show thinking indicator with appropriate message
        setIsThinking(true);
        setThinkingMessage(getThinkingMessage(complexity.level));

        // Wait for the delay
        await new Promise(resolve => setTimeout(resolve, actualDelay));
      }

      // Submit the message
      handleSubmit(event, chatRequestOptions);

      // Hide thinking indicator
      setIsThinking(false);
      setThinkingMessage(null);

      // Log analytics after response is received
      if (startTimeRef.current) {
        const actualResponseTime = Date.now() - startTimeRef.current;
        logQuestionComplexity(input, complexity, actualResponseTime, userId);
        startTimeRef.current = null;
      }
    },
    [input, handleSubmit, userId, messages, chatState]
  );

  return (
    <div className="flex flex-col min-w-0 h-dvh">
      <ChatHeader />

      <div className="relative flex-1">
        <Messages isLoading={status === 'submitted'} messages={messages} />
        
        {/* Thinking indicator for complexity-based delay */}
        {isThinking && thinkingMessage && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <ThinkingIndicator 
              message={thinkingMessage} 
              isVisible={true} 
              className="bg-white dark:bg-gray-800 shadow-md rounded-lg px-4 py-2"
            />
          </div>
        )}
      </div>

      <div className="h-[200px]"></div>

        <MultimodalInput
          setMessages={setMessages}
          handleInputChange={handleInputChange}
          input={input}
          handleSubmit={enhancedSubmit}
          isLoading={status === 'submitted'}
          stop={stop}
          messages={messages}
        />
    </div>
  );
}
