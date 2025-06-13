'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import XIcon from './icons/x';

interface ImagePreviewProps {
  imageUrl: string;
  fileName: string;
  onRemove: () => void;
}

export function ImagePreview({ imageUrl, fileName, onRemove }: ImagePreviewProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  const handleImageLoad = () => {
    setIsLoading(false);
  };
  
  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };
  
  return (
    <motion.div 
      className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="w-8 h-8 border-4 border-[#4B286D]/30 border-t-[#4B286D] rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/20 p-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 w-8 text-red-500 mb-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
          <p className="text-sm text-red-600 dark:text-red-400 text-center">Failed to load image</p>
        </div>
      )}
      
      {/* Image */}
      <div className="aspect-square bg-gray-50 dark:bg-gray-800">
        <img 
          src={imageUrl} 
          alt={fileName}
          className="w-full h-full object-cover"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
      
      {/* Overlay with file name and remove button */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 transition-opacity ${
          isHovering ? 'opacity-100' : 'opacity-70'
        }`}
      >
        <div className="flex items-center justify-between">
          <p className="text-white text-sm truncate max-w-[80%]" title={fileName}>
            {fileName}
          </p>
          
          <button 
            onClick={onRemove}
            className="p-1 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
            aria-label="Remove image"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
