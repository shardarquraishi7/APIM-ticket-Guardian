'use client';

import React, { useState, useRef } from 'react';
import { UploadIcon } from './icons/upload';
import { Button } from './button';

interface FileUploadProps {
  onFileSelected: (file: File) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  accept?: string;
  maxSize?: number; // in MB
}

export function FileUpload({
  onFileSelected,
  isLoading = false,
  error,
  accept = '.xlsx,.json',
  maxSize = 10 // 10MB default
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>(error);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const validateFile = (file: File): string | null => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.json')) {
      return 'Only Excel (.xlsx) or JSON (.json) files are allowed';
    }
    if (file.size > maxSize * 1024 * 1024) {
      return `File size exceeds ${maxSize}MB limit`;
    }
    return null;
  };
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const error = validateFile(file);
      
      if (error) {
        setLocalError(error);
        return;
      }
      
      setLocalError(undefined);
      try {
        // Simulate upload progress
        setUploadProgress(0);
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);
        
        await onFileSelected(file);
        
        // Complete the progress bar
        clearInterval(progressInterval);
        setUploadProgress(100);
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'Failed to process file');
        setUploadProgress(0);
      }
    }
  };
  
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const error = validateFile(file);
      
      if (error) {
        setLocalError(error);
        return;
      }
      
      setLocalError(undefined);
      try {
        // Simulate upload progress
        setUploadProgress(0);
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);
        
        await onFileSelected(file);
        
        // Complete the progress bar
        clearInterval(progressInterval);
        setUploadProgress(100);
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'Failed to process file');
        setUploadProgress(0);
      }
    }
  };
  
  const onButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    inputRef.current?.click();
  };
  
  return (
    <div className="w-full">
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          dragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
        } ${isLoading ? 'opacity-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={isLoading}
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center">
          <UploadIcon className="w-10 h-10 text-gray-400 mb-2" />
          <p className="mb-2 text-sm text-gray-700">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">Excel (.xlsx) or JSON (.json) files</p>
          
          {uploadProgress > 0 && (
            <div className="w-full mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-purple-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-center mt-1 text-gray-600">
                {uploadProgress < 100 ? 'Uploading...' : 'Upload complete!'}
              </p>
            </div>
          )}
          
          <Button 
            onClick={onButtonClick}
            disabled={isLoading}
            className="mt-4"
            size="sm"
          >
            {isLoading ? 'Uploading...' : 'Select File'}
          </Button>
        </div>
      </div>
      
      {(localError || error) && (
        <p className="mt-2 text-sm text-red-600">{localError || error}</p>
      )}
    </div>
  );
}
