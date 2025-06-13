'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { ArtificialIntelligenceIcon } from './icons';
import { DEPImageUpload } from './dep-image-upload';
import { UploadedImage } from '@/ai/handlers/dep-handler';
import { requiresImageAttachment } from '@/ai/handlers/dep-handler';
import { SKIPPED_ANSWER } from '@/constants';

interface DEPQuestionMessageProps {
  content: string;
  questionId: string;
  onAnswer: (answer: string, imageAttachments?: UploadedImage[]) => void;
  fullPrompt?: string; // Add the fullPrompt prop
}

/**
 * Component for displaying DEP questions in the chat
 * Using the same chat bubble pattern as in message.tsx
 */
export function DEPQuestionMessage({ content, questionId, onAnswer, fullPrompt }: DEPQuestionMessageProps) {
  const [answer, setAnswer] = useState('');
  const [imageAttachments, setImageAttachments] = useState<UploadedImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    
    if (!answer.trim()) {
      setValidationError('Please provide an answer');
      return;
    }
    
    // Check if this question requires image attachments but none are provided
    if (needsImageAttachment && imageAttachments.length === 0) {
      setValidationError('This question requires at least one image attachment');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call the onAnswer callback with the answer and image attachments
      onAnswer(answer, imageAttachments.length > 0 ? imageAttachments : undefined);
      
      // Reset the form
      setAnswer('');
      setImageAttachments([]);
    } catch (error) {
      console.error('Error submitting answer:', error);
      setValidationError('Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle skipping the question
  const handleSkip = () => {
    setIsSubmitting(true);
    
    try {
      // Call the onAnswer callback with the SKIPPED_ANSWER placeholder
      onAnswer(SKIPPED_ANSWER);
      
      // Reset the form
      setAnswer('');
      setImageAttachments([]);
    } catch (error) {
      console.error('Error skipping question:', error);
      setValidationError('Failed to skip question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleImagesUploaded = (images: UploadedImage[]) => {
    setImageAttachments(images);
  };
  
  // Check if this question requires image attachments
  const needsImageAttachment = requiresImageAttachment(questionId);
  
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
                {fullPrompt ? (
                  <div className="fullPromptCard">
                    <div className="mb-4">
                      {/* Extract and display "Why we're asking" section */}
                      {fullPrompt.includes("**Why we're asking") && (
                        <div className="bg-[#F2EFF4] dark:bg-[#2A1540] p-3 rounded-lg mb-4 border-l-4 border-[#4B286D] dark:border-[#6A3894]">
                          <h4 className="text-sm font-semibold text-[#4B286D] dark:text-[#9D6EFF] mb-1">
                            Why we're asking:
                          </h4>
                          <p className="text-sm">
                            {fullPrompt.split("**Why we're asking")[1].split("**Actual Question")[0].replace(":**", "").trim()}
                          </p>
                        </div>
                      )}
                      
                      {/* Extract and display the actual question */}
                      {fullPrompt.includes("**Actual Question") && (
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-[#4B286D] dark:text-[#9D6EFF] mb-2">Question</h3>
                          <p className="font-medium">
                            {fullPrompt.split("**Actual Question")[1].split("Available options:")[0].replace(":**", "").trim()}
                          </p>
                        </div>
                      )}
                      
                      {/* Display options if available */}
                      {fullPrompt.includes("Available options:") && (
                        <div className="mt-3">
                          <h4 className="text-sm font-semibold mb-2">Options:</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {fullPrompt
                              .split("Available options:")[1]
                              .split("Please type your answer")[0]
                              .trim()
                              .split("|")
                              .map((option, index) => (
                                <li key={index} className="text-sm">
                                  {option.trim()}
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Display cluster information if available */}
                      {fullPrompt.includes("This question is part of") && (
                        <div className="bg-[#F9F8FC] dark:bg-[#3A1D54] p-2 rounded-lg mb-4 text-sm">
                          <p>{fullPrompt.split("This question is part of")[1].split("Please type your answer")[0].trim()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <ReactMarkdown>{content}</ReactMarkdown>
                )}
                
                {/* Answer form */}
                <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-[#4B286D]/10 dark:border-[#6A3894]/20">
                  {/* Image upload component for questions that require it */}
                  {needsImageAttachment && (
                    <div className="mb-4">
                      <DEPImageUpload 
                        questionId={questionId}
                        onImagesUploaded={handleImagesUploaded}
                      />
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-2">
                    <label htmlFor="answer" className="text-sm font-medium">
                      Your Answer:
                    </label>
                    <textarea
                      id="answer"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="w-full p-3 border border-[#4B286D]/20 dark:border-[#6A3894]/30 rounded-lg bg-white/50 dark:bg-[#2A1540]/50 focus:outline-none focus:ring-2 focus:ring-[#4B286D] dark:focus:ring-[#6A3894] min-h-[100px]"
                      placeholder="Type your answer here..."
                      required
                    />
                    <div className="flex flex-col mt-2">
                      {validationError && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 mb-2"
                        >
                          {validationError}
                        </motion.p>
                      )}
                      <div className="flex justify-between">
                        <button
                          type="button"
                          onClick={handleSkip}
                          disabled={isSubmitting}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Skip Question
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-4 py-2 bg-[#4B286D] hover:bg-[#3A1D54] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
