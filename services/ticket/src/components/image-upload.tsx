'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';

interface ImageUploadProps {
  onImageSelected: (file: File) => void;
  isLoading?: boolean;
  error?: string;
  maxSize?: number; // in MB
}

export function ImageUpload({ 
  onImageSelected, 
  isLoading = false, 
  error,
  maxSize = 5 // Default 5MB
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndProcessFile(file);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndProcessFile(file);
    }
  };
  
  const validateAndProcessFile = (file: File) => {
    // Check if it's an image with allowed format
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      console.error('Invalid file type. Only JPG, PNG, GIF, and WebP are supported.');
      onImageSelected(new Error('Invalid file type. Only JPG, PNG, GIF, and WebP are supported.') as any);
      return;
    }
    
    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSize) {
      console.error(`File size exceeds ${maxSize}MB limit`);
      onImageSelected(new Error(`File size exceeds ${maxSize}MB limit`) as any);
      return;
    }
    
    // Process the file
    onImageSelected(file);
  };
  
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragging 
          ? 'border-[#4B286D] bg-[#4B286D]/5' 
          : 'border-gray-300 hover:border-[#4B286D]/50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden" 
        accept="image/*"
        onChange={handleFileChange}
      />
      
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#4B286D]/10 flex items-center justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-[#4B286D]" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
        
        <div className="text-sm text-gray-600">
          <p className="font-medium">Drag and drop your image here</p>
          <p className="mt-1">or</p>
        </div>
        
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={isLoading}
          className="px-4 py-2 bg-[#4B286D] text-white rounded-md hover:bg-[#3A1D54] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Uploading...' : 'Browse Files'}
        </button>
        
        <p className="text-xs text-gray-500">
          Supported formats: JPG, PNG, GIF (max {maxSize}MB)
        </p>
        
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-500 mt-2"
          >
            {error}
          </motion.p>
        )}
      </div>
    </div>
  );
}
