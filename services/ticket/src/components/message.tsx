'use client';

import type { Message, ToolInvocation } from 'ai';
import equal from 'fast-deep-equal';
import { AnimatePresence, motion } from 'motion/react';
import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { ArtificialIntelligenceIcon } from './icons';
import { RefreshIcon } from './icons/refresh';
import { JiraTicketForm } from './jira/ticket-form';
import { DEPFileMessage } from './dep-file-message';
import { DEPQuestionMessage } from './dep-question-message';
import { FileDownload } from './file-download';
import { UploadedFileStatus } from './uploaded-file-status';
import { isDEPFileUploadData, isDEPQuestionAnswerData, getDEPConversationState, requiresImageAttachment, UploadedImage } from '@/ai/handlers/dep-handler';

/**
 * Format message content to handle special formats like JSON-like strings
 */
function formatMessageContent(content: string): string {
  if (!content) return '';
  
  // Check if the content looks like a JSON object with 0:" patterns
  if (content.includes('0:"') || content.includes('f:{')) {
    try {
      // Try to extract actual text by removing formatting characters
      // This regex matches patterns like 0:" ", 1:" ", etc.
      const cleanedContent = content.replace(/\d+:"([^"]*)"/g, '$1')
        .replace(/\s*0:\s*"/g, ' ')
        .replace(/"\s*0:\s*"/g, ' ')
        .replace(/"\s*0:\s*$/g, '')
        .replace(/f:\{/g, '')
        .replace(/\}$/g, '')
        .replace(/\\n/g, '\n');
      
      console.log('Cleaned content:', cleanedContent);
      return cleanedContent;
    } catch (error) {
      console.error('Error formatting message content:', error);
      return content;
    }
  }
  
  return content;
}

interface PreviewMessageProps {
  message: Message;
}

// TELUS brand colors
const TELUS_PURPLE = {
  light: '#4B286D', // TELUS primary purple
  dark: '#3A1D54',  // Darker shade
  darker: '#2A1540', // Even darker
  accent: '#6A3894', // Lighter accent
};

const TELUS_GREEN = {
  light: '#00A400', // TELUS green
  dark: '#008300',
};

const PurePreviewMessage = ({ message }: PreviewMessageProps) => {
  // Filter out tool-invocation parts
  const visibleParts = message.parts?.filter(part => part.type !== 'tool-invocation') || [];
  
  return (
    <AnimatePresence>
      <motion.div
        className="w-full mx-auto max-w-3xl px-4 group/message perspective-1000"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        data-role={message.role}
        data-message-id={message.id}
      >
        <div
          className={cn(
            'flex flex-col gap-4 w-full',
            message.role === 'user' ? 'ml-auto max-w-2xl w-fit' : '',
          )}
        >
          {/* Only render one message container with one icon */}
          <div className="flex gap-4">
            {message.role === 'assistant' && visibleParts.length > 0 && (
              <motion.div 
                className="size-12 flex items-center justify-center shrink-0 relative"
                initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                transition={{ 
                  delay: 0.1, 
                  duration: 0.5,
                  type: "spring",
                  stiffness: 100
                }}
              >
                {/* Glowing background effect */}
                <div className="absolute inset-0 rounded-full bg-[#4B286D] opacity-30 blur-md animate-pulse"></div>
                
                {/* 3D-looking icon container with pseudo-3D rotation */}
                <motion.div 
                  className="size-12 flex items-center rounded-full justify-center z-10 bg-gradient-to-br from-[#4B286D] to-[#2A1540] shadow-lg border border-[#6A3894]/30 backdrop-blur-sm"
                  animate={{ 
                    rotateY: [0, 10, 0, -10, 0],
                    rotateX: [0, 5, 0, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                >
                  {/* Holographic effect overlay */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#6A3894]/10 to-[#4B286D]/20 opacity-50"></div>
                  
                  {/* Icon */}
                  <ArtificialIntelligenceIcon className="w-6 h-6 text-white drop-shadow-md relative z-10" />
                </motion.div>
              </motion.div>
            )}

            <div className="flex-1 flex flex-col gap-4 w-full">
              {message.content && (
                <motion.div 
                  className="flex flex-col gap-2 items-start w-full"
                  initial={{ x: message.role === 'user' ? 20 : -20, opacity: 0, rotateX: -5 }}
                  animate={{ x: 0, opacity: 1, rotateX: 0 }}
                  transition={{ 
                    delay: 0.2, 
                    duration: 0.4,
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  {/* Different styling for user vs assistant messages */}
                  {message.role === 'user' ? (
                    // Simpler user message bubble
                    <div className="bg-[#E6F7E6] dark:bg-[#1E4D2B] text-gray-950 dark:text-white px-4 py-3 rounded-xl border border-[#00A400]/20 dark:border-[#00C900]/30 shadow-sm ml-auto">
                      <ReactMarkdown>{formatMessageContent(message.content as string)}</ReactMarkdown>
                    </div>
                  ) : (
                    // More elaborate assistant message with futuristic elements
                    <div className="prose-p:mb-4 prose-p:last-of-type:mb-0 prose prose-md dark:prose-invert max-w-none prose-headings:text-[#4B286D] dark:prose-headings:text-[#9D6EFF] prose-a:text-[#00A400] dark:prose-a:text-[#00C900] prose-a:underline prose-strong:text-[#4B286D] dark:prose-strong:text-[#9D6EFF] relative bg-gradient-to-r from-[#F9F8FC]/90 to-[#F2EFF4]/90 dark:from-[#2A1540]/90 dark:to-[#3A1D54]/90 text-gray-950 dark:text-white px-6 py-4 rounded-2xl border border-[#4B286D]/20 dark:border-[#6A3894]/30 backdrop-blur-sm shadow-[0_8px_16px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(255,255,255,0.1)] dark:shadow-[0_8px_16px_rgba(0,0,0,0.3),inset_0_0_0_1px_rgba(255,255,255,0.05)]">
                      {/* Futuristic decorative elements */}
                      <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-2xl pointer-events-none">
                        <div className="absolute top-0 left-0 w-20 h-1 bg-gradient-to-r from-transparent via-[#6A3894]/30 to-transparent"></div>
                        <div className="absolute bottom-0 right-0 w-20 h-1 bg-gradient-to-r from-transparent via-[#4B286D]/30 to-transparent"></div>
                        <div className="absolute top-2 right-2 size-2 rounded-full bg-[#6A3894]/20"></div>
                        <div className="absolute bottom-2 left-2 size-2 rounded-full bg-[#4B286D]/20"></div>
                      </div>
                      
                      <ReactMarkdown>{message.content as string}</ReactMarkdown>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(PurePreviewMessage, (prevProps, nextProps) => {
  if (prevProps.message.content !== nextProps.message.content) return false;
  if (!equal(prevProps.message.toolInvocations, nextProps.message.toolInvocations)) return false;
  if (!equal(prevProps.message.data, nextProps.message.data)) return false;

  return true;
});

export const ToolMessage = ({ tool }: { tool: ToolInvocation }) => {
  switch (tool.toolName) {
    case 'createWorkforceJiraTicket':
      if (tool.state !== 'result') return <ToolCallMessage tool={tool} />;
      return <JiraTicketForm {...tool.result} />;
    default:
      return <ToolCallMessage tool={tool} />;
  }
};

export const DataMessage = ({ message }: { message: Message }) => {
  // Check if this is a DEP file message with download link
  if (message.data && message.role === 'assistant') {
    const state = getDEPConversationState(message.data);
    
    // Log the message data for debugging
    console.log('DataMessage - message data:', message.data);
    
    // Handle completed DEP file with download link
    if (state && state.completed && state.updatedFilePath) {
      console.log('DataMessage - completed DEP file with download link');
      return (
        <motion.div
          className="w-full mx-auto max-w-3xl px-4 group/message perspective-1000"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          data-role="assistant"
        >
          <div className="flex gap-4 w-full">
            {/* AI Icon - same as in regular messages */}
            <motion.div 
              className="size-12 flex items-center justify-center shrink-0 relative"
              initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{ 
                delay: 0.1, 
                duration: 0.5,
                type: "spring",
                stiffness: 100
              }}
            >
              <div className="absolute inset-0 rounded-full bg-[#4B286D] opacity-30 blur-md animate-pulse"></div>
              <motion.div 
                className="size-12 flex items-center rounded-full justify-center z-10 bg-gradient-to-br from-[#4B286D] to-[#2A1540] shadow-lg border border-[#6A3894]/30 backdrop-blur-sm"
                animate={{ 
                  rotateY: [0, 10, 0, -10, 0],
                  rotateX: [0, 5, 0, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#6A3894]/10 to-[#4B286D]/20 opacity-50"></div>
                <ArtificialIntelligenceIcon className="w-6 h-6 text-white drop-shadow-md relative z-10" />
              </motion.div>
            </motion.div>

            {/* Message content - using same styling as regular messages */}
            <div className="flex-1 flex flex-col gap-4 w-full">
              <motion.div 
                className="flex flex-col gap-2 items-start w-full"
                initial={{ x: -20, opacity: 0, rotateX: -5 }}
                animate={{ x: 0, opacity: 1, rotateX: 0 }}
                transition={{ 
                  delay: 0.2, 
                  duration: 0.4,
                  type: "spring",
                  stiffness: 100
                }}
              >
                <div className="prose-p:mb-4 prose-p:last-of-type:mb-0 prose prose-md dark:prose-invert max-w-none prose-headings:text-[#4B286D] dark:prose-headings:text-[#9D6EFF] prose-a:text-[#00A400] dark:prose-a:text-[#00C900] prose-a:underline prose-strong:text-[#4B286D] dark:prose-strong:text-[#9D6EFF] relative bg-gradient-to-r from-[#F9F8FC]/90 to-[#F2EFF4]/90 dark:from-[#2A1540]/90 dark:to-[#3A1D54]/90 text-gray-950 dark:text-white px-6 py-4 rounded-2xl border border-[#4B286D]/20 dark:border-[#6A3894]/30 backdrop-blur-sm shadow-[0_8px_16px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(255,255,255,0.1)] dark:shadow-[0_8px_16px_rgba(0,0,0,0.3),inset_0_0_0_1px_rgba(255,255,255,0.05)]">
                  {/* Futuristic decorative elements */}
                  <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-2xl pointer-events-none">
                    <div className="absolute top-0 left-0 w-20 h-1 bg-gradient-to-r from-transparent via-[#6A3894]/30 to-transparent"></div>
                    <div className="absolute bottom-0 right-0 w-20 h-1 bg-gradient-to-r from-transparent via-[#4B286D]/30 to-transparent"></div>
                    <div className="absolute top-2 right-2 size-2 rounded-full bg-[#6A3894]/20"></div>
                    <div className="absolute bottom-2 left-2 size-2 rounded-full bg-[#4B286D]/20"></div>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <ReactMarkdown>{message.content as string}</ReactMarkdown>
                    
                    {/* Download button */}
                    <div className="mt-4 pt-4 border-t border-[#4B286D]/10 dark:border-[#6A3894]/20">
                      <button 
                        onClick={() => {
                          if (state.updatedFilePath) {
                            const downloadUrl = `/api/xlsx/download?filePath=${encodeURIComponent(state.updatedFilePath)}`;
                            const link = document.createElement('a');
                            link.href = downloadUrl;
                            link.download = state.fileName || 'dep-file.xlsx';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
                        }}
                        className="flex items-center gap-2 text-[#4B286D] dark:text-[#9D6EFF] font-medium"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download Completed DEP File
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      );
    }
    
    // Handle DEP conversation state with questions
    if (state && state.anchorQuestions && state.anchorQuestions.length > 0) {
      console.log('DataMessage - DEP conversation with questions');
      
      // Check if we're on a specific question
      if (state.currentQuestionIndex < state.anchorQuestions.length) {
        const currentQuestion = state.anchorQuestions[state.currentQuestionIndex];
        
        // Get the nextPrompt from the message data if available
        const nextPrompt = message.data && typeof message.data === 'object' && 'nextPrompt' in message.data 
          ? message.data.nextPrompt as string 
          : undefined;
        
        console.log('DataMessage - DEP question with nextPrompt:', nextPrompt ? 'available' : 'not available');
        
        return (
          <DEPQuestionMessage
            content={message.content as string}
            questionId={currentQuestion.id}
            fullPrompt={nextPrompt} // Pass the nextPrompt to the component
            onAnswer={(answer, imageAttachments) => {
              console.log('Submitting answer', { answer, imageAttachments });
              // Submit the answer
              fetch('/api/dep/answer', {
                method: 'POST',
                body: JSON.stringify({
                  questionId: currentQuestion.id,
                  answer,
                  imageAttachments,
                  state
                }),
                headers: {
                  'Content-Type': 'application/json'
                }
              })
              .then(response => {
                if (!response.ok) {
                  throw new Error('Failed to submit answer');
                }
                return response.json();
              })
              .catch(error => {
                console.error('Error submitting answer:', error);
              });
            }}
          />
        );
      }
      return (
        <motion.div
          className="w-full mx-auto max-w-3xl px-4 group/message perspective-1000"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          data-role="assistant"
        >
          <div className="flex gap-4 w-full">
            {/* AI Icon - same as in regular messages */}
            <motion.div 
              className="size-12 flex items-center justify-center shrink-0 relative"
              initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{ 
                delay: 0.1, 
                duration: 0.5,
                type: "spring",
                stiffness: 100
              }}
            >
              <div className="absolute inset-0 rounded-full bg-[#4B286D] opacity-30 blur-md animate-pulse"></div>
              <motion.div 
                className="size-12 flex items-center rounded-full justify-center z-10 bg-gradient-to-br from-[#4B286D] to-[#2A1540] shadow-lg border border-[#6A3894]/30 backdrop-blur-sm"
                animate={{ 
                  rotateY: [0, 10, 0, -10, 0],
                  rotateX: [0, 5, 0, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#6A3894]/10 to-[#4B286D]/20 opacity-50"></div>
                <ArtificialIntelligenceIcon className="w-6 h-6 text-white drop-shadow-md relative z-10" />
              </motion.div>
            </motion.div>

            {/* Message content - using same styling as regular messages */}
            <div className="flex-1 flex flex-col gap-4 w-full">
              <motion.div 
                className="flex flex-col gap-2 items-start w-full"
                initial={{ x: -20, opacity: 0, rotateX: -5 }}
                animate={{ x: 0, opacity: 1, rotateX: 0 }}
                transition={{ 
                  delay: 0.2, 
                  duration: 0.4,
                  type: "spring",
                  stiffness: 100
                }}
              >
                <div className="prose-p:mb-4 prose-p:last-of-type:mb-0 prose prose-md dark:prose-invert max-w-none prose-headings:text-[#4B286D] dark:prose-headings:text-[#9D6EFF] prose-a:text-[#00A400] dark:prose-a:text-[#00C900] prose-a:underline prose-strong:text-[#4B286D] dark:prose-strong:text-[#9D6EFF] relative bg-gradient-to-r from-[#F9F8FC]/90 to-[#F2EFF4]/90 dark:from-[#2A1540]/90 dark:to-[#3A1D54]/90 text-gray-950 dark:text-white px-6 py-4 rounded-2xl border border-[#4B286D]/20 dark:border-[#6A3894]/30 backdrop-blur-sm shadow-[0_8px_16px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(255,255,255,0.1)] dark:shadow-[0_8px_16px_rgba(0,0,0,0.3),inset_0_0_0_1px_rgba(255,255,255,0.05)]">
                  {/* Futuristic decorative elements */}
                  <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-2xl pointer-events-none">
                    <div className="absolute top-0 left-0 w-20 h-1 bg-gradient-to-r from-transparent via-[#6A3894]/30 to-transparent"></div>
                    <div className="absolute bottom-0 right-0 w-20 h-1 bg-gradient-to-r from-transparent via-[#4B286D]/30 to-transparent"></div>
                    <div className="absolute top-2 right-2 size-2 rounded-full bg-[#6A3894]/20"></div>
                    <div className="absolute bottom-2 left-2 size-2 rounded-full bg-[#4B286D]/20"></div>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <ReactMarkdown>{message.content as string}</ReactMarkdown>
                    
                    {/* Display anchor questions if available */}
                    {state.anchorQuestions && state.anchorQuestions.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-[#4B286D]/10 dark:border-[#6A3894]/20">
                        <h3 className="text-lg font-medium mb-2">Key Questions</h3>
                        <ul className="space-y-2">
                          {state.anchorQuestions.map((q: any, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center size-5 rounded-full bg-[#4B286D]/10 dark:bg-[#6A3894]/20 text-[#4B286D] dark:text-[#9D6EFF] text-xs font-medium mt-0.5">
                                {i + 1}
                              </span>
                              <span>{q.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* File status indicator */}
                    {state.fileName && (
                      <div className="mt-4 pt-4 border-t border-[#4B286D]/10 dark:border-[#6A3894]/20">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          <span>File: {state.fileName}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      );
    }
    
    // Handle DEP file analysis message
    if (typeof message.data === 'object' && 
        message.data !== null && 
        'type' in message.data && 
        message.data.type === 'dep-file-analysis') {
      console.log('DataMessage - DEP file analysis message:', message.data);
      
      // Safely extract state properties
      const state = message.data.state as any;
      const fileName = state?.fileName;
      const filePath = state?.filePath;
      
      // Use the standard assistant message styling with chat bubble pattern
      return (
        <motion.div
          className="w-full mx-auto max-w-3xl px-4 group/message perspective-1000"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          data-role="assistant"
        >
          <div className="flex gap-4 w-full">
            {/* AI Icon - same as in regular messages */}
            <motion.div 
              className="size-12 flex items-center justify-center shrink-0 relative"
              initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{ 
                delay: 0.1, 
                duration: 0.5,
                type: "spring",
                stiffness: 100
              }}
            >
              <div className="absolute inset-0 rounded-full bg-[#4B286D] opacity-30 blur-md animate-pulse"></div>
              <motion.div 
                className="size-12 flex items-center rounded-full justify-center z-10 bg-gradient-to-br from-[#4B286D] to-[#2A1540] shadow-lg border border-[#6A3894]/30 backdrop-blur-sm"
                animate={{ 
                  rotateY: [0, 10, 0, -10, 0],
                  rotateX: [0, 5, 0, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#6A3894]/10 to-[#4B286D]/20 opacity-50"></div>
                <ArtificialIntelligenceIcon className="w-6 h-6 text-white drop-shadow-md relative z-10" />
              </motion.div>
            </motion.div>

            {/* Message content - using same styling as regular messages */}
            <div className="flex-1 flex flex-col gap-4 w-full">
              <motion.div 
                className="flex flex-col gap-2 items-start w-full"
                initial={{ x: -20, opacity: 0, rotateX: -5 }}
                animate={{ x: 0, opacity: 1, rotateX: 0 }}
                transition={{ 
                  delay: 0.2, 
                  duration: 0.4,
                  type: "spring",
                  stiffness: 100
                }}
              >
                <div className="prose-p:mb-4 prose-p:last-of-type:mb-0 prose prose-md dark:prose-invert max-w-none prose-headings:text-[#4B286D] dark:prose-headings:text-[#9D6EFF] prose-a:text-[#00A400] dark:prose-a:text-[#00C900] prose-a:underline prose-strong:text-[#4B286D] dark:prose-strong:text-[#9D6EFF] relative bg-gradient-to-r from-[#F9F8FC]/90 to-[#F2EFF4]/90 dark:from-[#2A1540]/90 dark:to-[#3A1D54]/90 text-gray-950 dark:text-white px-6 py-4 rounded-2xl border border-[#4B286D]/20 dark:border-[#6A3894]/30 backdrop-blur-sm shadow-[0_8px_16px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(255,255,255,0.1)] dark:shadow-[0_8px_16px_rgba(0,0,0,0.3),inset_0_0_0_1px_rgba(255,255,255,0.05)]">
                  {/* Futuristic decorative elements */}
                  <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-2xl pointer-events-none">
                    <div className="absolute top-0 left-0 w-20 h-1 bg-gradient-to-r from-transparent via-[#6A3894]/30 to-transparent"></div>
                    <div className="absolute bottom-0 right-0 w-20 h-1 bg-gradient-to-r from-transparent via-[#4B286D]/30 to-transparent"></div>
                    <div className="absolute top-2 right-2 size-2 rounded-full bg-[#6A3894]/20"></div>
                    <div className="absolute bottom-2 left-2 size-2 rounded-full bg-[#4B286D]/20"></div>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <ReactMarkdown>{message.content as string}</ReactMarkdown>
                    
                    {/* DEP stats could be included here in a more compact format */}
                    {state && state.totalQuestions && (
                      <div className="mt-4 pt-4 border-t border-[#4B286D]/10 dark:border-[#6A3894]/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Progress</span>
                          <span className="font-medium">{Math.round(((state.answeredQuestions || 0) / (state.totalQuestions || 1)) * 100)}%</span>
                        </div>
                        
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-[#4B286D] to-[#6A3894] h-2 rounded-full"
                            style={{ width: `${Math.round(((state.answeredQuestions || 0) / (state.totalQuestions || 1)) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Download button if needed */}
                    {filePath && fileName && state?.completed && (
                      <div className="mt-4 pt-4 border-t border-[#4B286D]/10 dark:border-[#6A3894]/20">
                        <button 
                          onClick={() => {
                            if (filePath && fileName) {
                              const downloadUrl = `/api/xlsx/download?filePath=${encodeURIComponent(filePath)}`;
                              const link = document.createElement('a');
                              link.href = downloadUrl;
                              link.download = fileName;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }
                          }}
                          className="flex items-center gap-2 text-[#4B286D] dark:text-[#9D6EFF] font-medium"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          Download DEP File
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      );
    }
    
    // Handle file upload status message
    if (typeof message.data === 'object' && 
        message.data !== null && 
        'type' in message.data && 
        message.data.type === 'dep-file-upload') {
      console.log('DataMessage - DEP file upload status message');
      return (
        <motion.div
          className="w-full mx-auto max-w-3xl px-4 group/message perspective-1000"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          data-role="assistant"
        >
          <div className="flex gap-4 w-full">
            {/* AI Icon - same as in regular messages */}
            <motion.div 
              className="size-12 flex items-center justify-center shrink-0 relative"
              initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{ 
                delay: 0.1, 
                duration: 0.5,
                type: "spring",
                stiffness: 100
              }}
            >
              <div className="absolute inset-0 rounded-full bg-[#4B286D] opacity-30 blur-md animate-pulse"></div>
              <motion.div 
                className="size-12 flex items-center rounded-full justify-center z-10 bg-gradient-to-br from-[#4B286D] to-[#2A1540] shadow-lg border border-[#6A3894]/30 backdrop-blur-sm"
                animate={{ 
                  rotateY: [0, 10, 0, -10, 0],
                  rotateX: [0, 5, 0, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#6A3894]/10 to-[#4B286D]/20 opacity-50"></div>
                <ArtificialIntelligenceIcon className="w-6 h-6 text-white drop-shadow-md relative z-10" />
              </motion.div>
            </motion.div>

            {/* Message content - using same styling as regular messages */}
            <div className="flex-1 flex flex-col gap-4 w-full">
              <motion.div 
                className="flex flex-col gap-2 items-start w-full"
                initial={{ x: -20, opacity: 0, rotateX: -5 }}
                animate={{ x: 0, opacity: 1, rotateX: 0 }}
                transition={{ 
                  delay: 0.2, 
                  duration: 0.4,
                  type: "spring",
                  stiffness: 100
                }}
              >
                <div className="prose-p:mb-4 prose-p:last-of-type:mb-0 prose prose-md dark:prose-invert max-w-none prose-headings:text-[#4B286D] dark:prose-headings:text-[#9D6EFF] prose-a:text-[#00A400] dark:prose-a:text-[#00C900] prose-a:underline prose-strong:text-[#4B286D] dark:prose-strong:text-[#9D6EFF] relative bg-gradient-to-r from-[#F9F8FC]/90 to-[#F2EFF4]/90 dark:from-[#2A1540]/90 dark:to-[#3A1D54]/90 text-gray-950 dark:text-white px-6 py-4 rounded-2xl border border-[#4B286D]/20 dark:border-[#6A3894]/30 backdrop-blur-sm shadow-[0_8px_16px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(255,255,255,0.1)] dark:shadow-[0_8px_16px_rgba(0,0,0,0.3),inset_0_0_0_1px_rgba(255,255,255,0.05)]">
                  {/* Futuristic decorative elements */}
                  <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-2xl pointer-events-none">
                    <div className="absolute top-0 left-0 w-20 h-1 bg-gradient-to-r from-transparent via-[#6A3894]/30 to-transparent"></div>
                    <div className="absolute bottom-0 right-0 w-20 h-1 bg-gradient-to-r from-transparent via-[#4B286D]/30 to-transparent"></div>
                    <div className="absolute top-2 right-2 size-2 rounded-full bg-[#6A3894]/20"></div>
                    <div className="absolute bottom-2 left-2 size-2 rounded-full bg-[#4B286D]/20"></div>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <ReactMarkdown>{message.content as string}</ReactMarkdown>
                    
                    {/* File status indicator */}
                    <div className="mt-4 pt-4 border-t border-[#4B286D]/10 dark:border-[#6A3894]/20">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <span className="font-medium">{message.data.fileName as string}</span>
                        <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                          (message.data.uploadStatus as string) === 'success' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {(message.data.uploadStatus as string) === 'success' ? 'Uploaded' : 'Error'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      );
    }
  }
  
  // Default to regular message content
  return null;
};

export const ToolCallMessage = ({ tool }: { tool: ToolInvocation }) => {
  // Hide all tool invocations from the UI
  return null;
};

export const ThinkingMessage = () => {
  const role = 'assistant';

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message perspective-1000"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      data-role={role}
    >
      <div className="flex gap-4 w-full">
        {/* Futuristic animated AI icon */}
        <motion.div 
          className="size-12 flex items-center justify-center shrink-0 relative"
          initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          transition={{ 
            duration: 0.5,
            type: "spring",
            stiffness: 100
          }}
        >
          {/* Pulsing glow effect */}
          <motion.div 
            className="absolute inset-0 rounded-full bg-[#4B286D] opacity-30 blur-md"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: "loop"
            }}
          ></motion.div>
          
          {/* 3D-looking container with holographic effect */}
          <motion.div 
            className="size-12 flex items-center rounded-full justify-center z-10 bg-gradient-to-br from-[#4B286D] to-[#2A1540] shadow-lg border border-[#6A3894]/30 backdrop-blur-sm"
            animate={{ 
              rotateY: [0, 15, 0, -15, 0],
              rotateX: [0, 10, 0, -10, 0],
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              repeatType: "loop"
            }}
          >
            {/* Holographic overlay */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#6A3894]/10 to-[#4B286D]/20 opacity-50"></div>
            
            {/* Spinning icon */}
            <RefreshIcon className="w-6 h-6 text-white drop-shadow-md relative z-10 animate-spin" />
          </motion.div>
        </motion.div>

        {/* Futuristic thinking message */}
        <motion.div 
          className="flex items-center"
          initial={{ opacity: 0, x: -20, rotateX: -5 }}
          animate={{ opacity: 1, x: 0, rotateX: 0 }}
          transition={{ 
            delay: 0.2, 
            duration: 0.5,
            type: "spring",
            stiffness: 100
          }}
        >
          <div className="relative bg-gradient-to-r from-[#F9F8FC]/90 to-[#F2EFF4]/90 dark:from-[#2A1540]/90 dark:to-[#3A1D54]/90 text-gray-700 dark:text-[#9D6EFF] px-6 py-3 rounded-2xl border border-[#4B286D]/20 dark:border-[#6A3894]/30 backdrop-blur-sm shadow-[0_8px_16px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(255,255,255,0.1)] dark:shadow-[0_8px_16px_rgba(0,0,0,0.3),inset_0_0_0_1px_rgba(255,255,255,0.05)] font-medium">
            {/* Futuristic decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-2xl pointer-events-none">
              <div className="absolute top-0 left-0 w-16 h-1 bg-gradient-to-r from-transparent via-[#6A3894]/30 to-transparent"></div>
              <div className="absolute bottom-0 right-0 w-16 h-1 bg-gradient-to-r from-transparent via-[#4B286D]/30 to-transparent"></div>
              <div className="absolute top-2 right-2 size-1.5 rounded-full bg-[#6A3894]/30"></div>
              <div className="absolute bottom-2 left-2 size-1.5 rounded-full bg-[#4B286D]/30"></div>
            </div>
            
            {/* Animated text with dots */}
            <div className="flex items-center gap-1">
              <span>Processing</span>
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
                className="text-[#4B286D] dark:text-[#9D6EFF]"
              >.</motion.span>
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop", delay: 0.2 }}
                className="text-[#4B286D] dark:text-[#9D6EFF]"
              >.</motion.span>
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop", delay: 0.4 }}
                className="text-[#4B286D] dark:text-[#9D6EFF]"
              >.</motion.span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
