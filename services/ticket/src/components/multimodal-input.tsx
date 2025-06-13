'use client';

import type { ChatRequestOptions, Message } from 'ai';
import { type Dispatch, type SetStateAction, memo, useCallback, useEffect, useRef, useState } from 'react';
import { useWindowSize } from 'usehooks-ts';
import { cn } from '@/lib/utils';
import { sanitizeUIMessages } from '@/utils/sanitize-ui-messages';
import { Button } from './button';
import { SendIcon } from './icons/send';
import { StopIcon } from './icons/stop';
import { UploadIcon } from './icons/upload';
import { Textarea } from './textarea';
import { FileUpload } from './file-upload';
import { UploadedFileStatus } from './uploaded-file-status';


interface MultimodalInputProps {
  input: string;
  handleInputChange: any;
  isLoading: boolean;
  stop: () => void;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions,
  ) => void;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
  messages: Array<Message>;
  className?: string;
}

function PureMultimodalInput({
  input,
  handleInputChange,
  isLoading,
  stop,
  handleSubmit,
  setMessages,
  messages,
  className,
}: MultimodalInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [fileUploadError, setFileUploadError] = useState<string | undefined>();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ fileName: string; filePath: string } | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = '40px';
    }
  };

  const submitForm = useCallback(async () => {
    // Check if this is a DEP question answer
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.data && typeof lastMessage.data === 'object' && lastMessage.data !== null) {
      // Cast data to any to access properties safely
      const data = lastMessage.data as any;
      
      if (data.state && data.state.anchorQuestions && data.state.currentQuestionIndex !== undefined) {
        // This is a DEP conversation with a question
        const state = data.state;
        const currentQuestionIndex = state.currentQuestionIndex;
        
        if (currentQuestionIndex < state.anchorQuestions.length) {
          const currentQuestion = state.anchorQuestions[currentQuestionIndex];
          
          console.log('Submitting answer for DEP question:', currentQuestion.id);
          
          try {
            // Call the DEP answer API
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
            const answerResponse = await fetch(`${baseUrl}/api/dep/answer`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                questionId: currentQuestion.id,
                answer: input.trim(),
                state: state
              }),
              cache: 'no-store',
            });
            
            if (!answerResponse.ok) {
              const error = await answerResponse.json();
              throw new Error(error.error || 'Failed to process answer');
            }
            
            const answerResult = await answerResponse.json();
            console.log('DEP answer API response:', answerResult);
            
            // Add the user message
            setMessages((messages) => [
              ...messages,
              {
                id: `user-${Date.now()}`,
                role: 'user',
                content: input
              }
            ]);
            
            // Add the assistant message with the next question
            setMessages((messages) => [
              ...messages,
              {
                id: `dep-${Date.now()}`,
                role: 'assistant',
                content: answerResult.message,
                data: {
                  type: 'dep-file-analysis',
                  state: answerResult.state,
                  nextPrompt: answerResult.nextPrompt // Include the nextPrompt in the message data
                }
              }
            ]);
            
              // Process the file when all questions are answered
              if (answerResult.state.completed) {
                console.log('All questions answered, processing DEP file...');
                
                try {
                  // Call the process API to update the file with all answers
                  const processResponse = await fetch(`${baseUrl}/api/dep/process`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      filePath: answerResult.state.filePath,
                      action: 'update',
                      answers: answerResult.state.anchorQuestions
                        .filter((q: { answer?: string }) => q.answer)
                        .map((q: { id: string; answer?: string }) => ({
                          id: q.id,
                          answer: q.answer
                        }))
                    }),
                  });
                  
                  if (!processResponse.ok) {
                    throw new Error('Failed to update DEP file');
                  }
                  
                  const processResult = await processResponse.json();
                  
                  // Add a message about the file being updated
                  setMessages((messages) => [
                    ...messages,
                    {
                      id: `dep-process-${Date.now()}`,
                      role: 'assistant',
                      content: `Your DEP file has been updated with all answers. You can download the updated file below.`,
                      data: {
                        type: 'dep-file-update',
                        filePath: processResult.updatedFilePath || processResult.filePath,
                        fileName: processResult.filename,
                        uploadStatus: 'success',
                        stats: processResult.stats
                      }
                    }
                  ]);
                } catch (err) {
                  console.error('Error updating DEP file:', err);
                  setMessages((messages) => [
                    ...messages,
                    {
                      id: `dep-error-${Date.now()}`,
                      role: 'assistant',
                      content: `Error updating DEP file. Please try again.`
                    }
                  ]);
                }
              }
            
            // Clear the input
            handleInputChange({ target: { value: '' } } as any);
            resetHeight();
            
            return; // Skip the normal submit
          } catch (err) {
            console.error('DEP answer error:', err);
            setMessages((messages) => [
              ...messages,
              {
                id: `dep-error-${Date.now()}`,
                role: 'assistant',
                content: `Error processing your answer: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`
              }
            ]);
            return;
          }
        }
      }
    }
    
    // Normal message submission
    handleSubmit(undefined);
    resetHeight();

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [handleSubmit, width, messages, input, handleInputChange]);

  const handleFileSelected = async (file: File) => {
    setIsUploading(true);
    setFileUploadError(undefined);
    
    try {
      console.log('Uploading file:', file.name);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await fetch(`${baseUrl}/api/api-docs/upload`, {
        method: 'POST',
        body: formData,
        cache: 'no-store',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload file');
      }
      
      const data = await response.json();
      console.log('File upload response:', data);
      
      // First add a user message about uploading the file
      const userMessage = `I've uploaded an API documentation file: ${file.name}`;
      setMessages((messages) => [
        ...messages,
        {
          id: `user-${Date.now()}`,
          role: 'user',
          content: userMessage
        }
      ]);
      
      // Instead of using the chat API directly, let's call the analyze API first
      try {
        console.log('Analyzing API documentation file directly');
        
        // Call the analyze API directly
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const analyzeResponse = await fetch(`${baseUrl}/api/api-docs/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filePath: data.filePath,
            fileName: file.name,
          }),
          cache: 'no-store',
        });
        
        if (!analyzeResponse.ok) {
          const error = await analyzeResponse.json();
          throw new Error(error.error || 'Failed to analyze API documentation file');
        }
        
        const analyzeResult = await analyzeResponse.json();
        console.log('API docs analyze API response:', analyzeResult);
        
        // Now that we have the analysis result, add it to the chat
        setMessages((messages) => [
          ...messages,
          {
            id: `api-${Date.now()}`,
            role: 'assistant',
            content: analyzeResult.message,
            data: {
              type: 'api-docs-analysis',
              state: analyzeResult.state,
              fileData: analyzeResult.fileData || analyzeResult.analysisResult
            }
          }
        ]);
      } catch (err) {
        console.error('API docs analyze error:', err);
        setMessages((messages) => [
          ...messages,
          {
            id: `api-error-${Date.now()}`,
            role: 'assistant',
            content: `Error analyzing API documentation file: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`
          }
        ]);
      }
      
      // Update uploaded file state
      setUploadedFile({
        fileName: file.name,
        filePath: data.filePath
      });
      
      // Close file upload UI
      setShowFileUpload(false);
    } catch (err) {
      console.error('File upload error:', err);
      setFileUploadError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form className="fixed bottom-0 left-0 right-0 flex justify-center mx-auto px-4 py-1 mb-6 md:mb-8 z-50 mt-4">
      <div className="w-full md:max-w-3xl bg-white dark:bg-gray-900 backdrop-blur-sm shadow-lg rounded-xl border border-gray-800 p-2 pt-6">
        {/* Only show the file upload UI when the user clicks the upload button */}
        {showFileUpload && (
          <div className="mb-4 px-2">
            <FileUpload
              onFileSelected={handleFileSelected}
              isLoading={isUploading}
              error={fileUploadError}
            />
          </div>
        )}
        
        {/* Always show the file status in the input area when a file is uploaded */}
        {uploadedFile && !showFileUpload && (
          <div className="mb-4 px-2">
            <UploadedFileStatus
              fileName={uploadedFile.fileName}
              showDownload={false}
            />
          </div>
        )}
        <div className="relative w-full flex flex-col gap-2">
          <Textarea
            ref={textareaRef}
            placeholder="Message API Ticketing Support..."
            value={input}
            onChange={handleInputChange}
            className={cn(
              'min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-xl !text-base text-gray-900 bg-white dark:bg-gray-900 dark:text-white pb-6 pt-1 px-2 border-none ring-1 ring-border ring-gray-200 dark:ring-gray-700 focus:outline-none focus:ring-purple-800 dark:focus:ring-purple-600 placeholder:text-gray-500 dark:placeholder:text-gray-400',
              className,
            )}
            rows={2}
            autoFocus
            disabled={isLoading}
            data-testid="message-input"
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();

                if (isLoading) {
                  console.error('Please wait for the model to finish its response!');
                } else {
                  submitForm();
                }
              }
            }}
          />

          <div className="absolute bottom-0 right-0 p-2 w-fit flex flex-row justify-end items-center gap-2">
            {!isLoading && (
              <button
                type="button"
                onClick={() => setShowFileUpload(!showFileUpload)}
                className="p-1.5 text-gray-500 rounded-full hover:bg-gray-100 border"
                aria-label="Upload API Documentation file"
                title="Upload API Documentation file"
              >
                <UploadIcon className="w-4 h-4" />
              </button>
            )}
            {isLoading ? (
              <StopButton stop={stop} setMessages={setMessages} />
            ) : (
              <SendButton input={input} submitForm={submitForm} uploadQueue={[]} />
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

export const MultimodalInput = memo(PureMultimodalInput, (prevProps, nextProps) => {
  if (prevProps.input !== nextProps.input) return false;
  if (prevProps.isLoading !== nextProps.isLoading) return false;

  return true;
});

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
}) {
  return (
    <Button
      className="rounded-full p-1.5 h-fit border dark:border-purple-900"
      onClick={(event) => {
        event.preventDefault();
        stop();
        setMessages((messages) => sanitizeUIMessages(messages));
      }}
      data-testid="stop-button"
    >
      <StopIcon className="w-4 h-4" />
    </Button>
  );
}

const StopButton = memo(PureStopButton);

function PureSendButton({
  submitForm,
  input,
}: {
  submitForm: () => void;
  input: string;
  uploadQueue: Array<string>;
}) {
  return (
    <Button
      className="rounded-full p-1.5 h-fit border dark:border-purple-900"
      onClick={(event) => {
        event.preventDefault();
        submitForm();
      }}
      disabled={input.length === 0}
      data-testid="send-button"
    >
      <SendIcon className="w-4 h-4" />
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.input !== nextProps.input) return false;
  return true;
});
