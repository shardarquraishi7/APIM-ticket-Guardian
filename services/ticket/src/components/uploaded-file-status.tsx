'use client';

import React from 'react';
import { motion } from 'motion/react';
import { FileIcon } from './icons/file';
import { DownloadIcon } from './icons/download';
import { ArtificialIntelligenceIcon } from './icons';

interface UploadedFileStatusProps {
  fileName: string;
  onDownload?: () => void;
  showDownload?: boolean;
}

export function UploadedFileStatus({
  fileName,
  onDownload,
  showDownload = true
}: UploadedFileStatusProps) {
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
                <p>I've received your file and processed it successfully.</p>
                
                {/* File status indicator */}
                <div className="mt-4 pt-4 border-t border-[#4B286D]/10 dark:border-[#6A3894]/20">
                  <div className="flex items-center gap-2">
                    <FileIcon className="h-5 w-5 text-[#4B286D] dark:text-[#9D6EFF]" />
                    <span className="font-medium">{fileName}</span>
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Uploaded
                    </span>
                  </div>
                </div>
                
                {/* Download button */}
                {showDownload && onDownload && (
                  <div className="mt-4 pt-4 border-t border-[#4B286D]/10 dark:border-[#6A3894]/20">
                    <button 
                      onClick={onDownload}
                      className="flex items-center gap-2 text-[#4B286D] dark:text-[#9D6EFF] font-medium"
                    >
                      <DownloadIcon className="h-4 w-4" />
                      Download File
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
