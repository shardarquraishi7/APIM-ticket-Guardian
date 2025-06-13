'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { ArtificialIntelligenceIcon } from './icons';
import { DownloadIcon } from './icons/download';
import { FileIcon } from './icons/file';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { SKIPPED_ANSWER } from '@/constants';

interface DEPFileMessageProps {
  content: string;
  fileName?: string;
  filePath: string;
  uploadStatus?: 'success' | 'error';
  stats?: {
    totalQuestions: number;
    answeredQuestions: number;
    preExistingAnswers: number;
    predictedAnswers: number;
    skippedQuestions?: number;
  };
  questions?: Array<{
    id: string;
    question: string;
    answer?: string;
    confidence?: number;
    metadata?: {
      skipped?: boolean;
      merged?: boolean;
      source?: 'user' | 'skipped' | 'inference' | 'inference-direct' | 'inference-merged';
      [key: string]: any;
    };
  }>;
}

/**
 * Component for displaying DEP file messages in the chat
 * Using the same chat bubble pattern as in message.tsx
 */
export function DEPFileMessage({ content, fileName, filePath, uploadStatus, stats }: DEPFileMessageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Handle file download
  const handleDownload = () => {
    try {
      if (filePath) {
        // Create a URL with the file path
        const downloadUrl = `/api/xlsx/download?filePath=${encodeURIComponent(filePath)}`;
        
        // Create a temporary anchor element
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName || 'dep-file.xlsx';
        document.body.appendChild(link);
        
        // Trigger the download
        link.click();
        
        // Clean up
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Error downloading file:', err);
    }
  };
  
  // Calculate completion percentage if stats are available
  const completionPercentage = stats ? Math.round(((stats.answeredQuestions || 0) / (stats.totalQuestions || 1)) * 100) : 0;
  
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
                <ReactMarkdown>{content}</ReactMarkdown>
                
                {/* File status indicator */}
                <div className="mt-4 pt-4 border-t border-[#4B286D]/10 dark:border-[#6A3894]/20">
                  <div className="flex items-center gap-2">
                    <FileIcon className="h-5 w-5 text-[#4B286D] dark:text-[#9D6EFF]" />
                    <span className="font-medium">{fileName || 'DEP File'}</span>
                    {uploadStatus && (
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                        uploadStatus === 'success' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {uploadStatus === 'success' ? 'Uploaded' : 'Error'}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Stats section - only show if stats are available */}
                {stats && (
                  <div className="mt-4 pt-4 border-t border-[#4B286D]/10 dark:border-[#6A3894]/20">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid grid-cols-2 mb-4">
                        <TabsTrigger value="overview">
                          <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                              <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
                            </svg>
                            Overview
                          </span>
                        </TabsTrigger>
                        <TabsTrigger value="details">
                          <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <path d="M14 2v6h6" />
                              <path d="M16 13H8" />
                              <path d="M16 17H8" />
                              <path d="M10 9H8" />
                            </svg>
                            Details
                          </span>
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="overview" className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Progress</span>
                          <span className="font-medium">{completionPercentage}%</span>
                        </div>
                        
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-[#4B286D] to-[#6A3894] h-2 rounded-full transition-all duration-1000 ease-in-out relative"
                            style={{ width: `${completionPercentage}%` }}
                          >
                            {/* Animated shine effect */}
                            <div className="absolute inset-0 overflow-hidden">
                              <div 
                                className="w-20 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent absolute -left-20 animate-shine"
                              ></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 pt-2">
                          <div className="text-center">
                            <div className="text-sm font-medium">{stats.preExistingAnswers}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Pre-existing</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium">{stats.answeredQuestions - stats.preExistingAnswers}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Answered</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium">{stats.totalQuestions - stats.answeredQuestions}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Remaining</div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="details" className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Pre-existing Answers</span>
                          <span className="font-medium">{stats.preExistingAnswers}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">User-provided Answers</span>
                          <span className="font-medium">{stats.answeredQuestions - stats.preExistingAnswers - stats.predictedAnswers}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">AI-predicted Answers</span>
                          <span className="font-medium">{stats.predictedAnswers}</span>
                        </div>
                        {stats.skippedQuestions && stats.skippedQuestions > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Skipped Questions</span>
                            <span className="font-medium">{stats.skippedQuestions}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Total Answered</span>
                          <span className="font-medium">{stats.answeredQuestions}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Remaining Questions</span>
                          <span className="font-medium">{stats.totalQuestions - stats.answeredQuestions}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</span>
                          <span className="font-medium">{completionPercentage}%</span>
                        </div>
                        
                        {/* Legend for answer sources */}
                        <div className="mt-4 pt-4 border-t border-[#4B286D]/10 dark:border-[#6A3894]/20">
                          <h4 className="text-sm font-medium mb-2">Answer Sources</h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                              <span>User-provided (100% confidence)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
                              <span>Direct inference (90% confidence)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="inline-block w-3 h-3 rounded-full bg-purple-500"></span>
                              <span>Cascading inference (70% confidence)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="inline-block w-3 h-3 rounded-full bg-yellow-500"></span>
                              <span>Merged multi-select (60% confidence)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
                              <span>Skipped questions (10% confidence)</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
                
                {/* Download button */}
                {filePath && (
                  <div className="mt-4 pt-4 border-t border-[#4B286D]/10 dark:border-[#6A3894]/20">
                    <button 
                      onClick={handleDownload}
                      className="flex items-center gap-2 text-[#4B286D] dark:text-[#9D6EFF] font-medium"
                    >
                      <DownloadIcon className="h-4 w-4" />
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
