'use client';

import React, { useState, useRef } from 'react';
import { ImagePreview } from './image-preview';
import { UploadIcon } from './icons/upload';

interface TicketImageUploadProps {
  onImageSelected: (file: File) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  accept?: string;
  maxSize?: number; // in MB
}

export function TicketImageUpload({
  onImageSelected,
  isLoading = false,
  error,
  accept = 'image/png,image/jpeg,image/jpg',
  maxSize = 5 // 5MB default
}: TicketImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>(error);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
    if (!file.type.startsWith('image/')) {
      return 'Only image files are allowed';
    }
    if (file.size > maxSize * 1024 * 1024) {
      return `File size exceeds ${maxSize}MB limit`;
    }
    return null;
  };
  
  const processFile = async (file: File) => {
    const error = validateFile(file);
    
    if (error) {
      setLocalError(error);
      return;
    }
    
    setLocalError(undefined);
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    try {
      await onImageSelected(file);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to process image');
      setSelectedImage(null);
    }
  };
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };
  
  const onButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    inputRef.current?.click();
  };
  
  return (
    <div className="w-full">
      {selectedImage ? (
        <div className="mb-4">
          <ImagePreview 
            imageUrl={selectedImage} 
            fileName="Uploaded image" 
            onRemove={() => setSelectedImage(null)} 
          />
        </div>
      ) : (
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
            <p className="text-xs text-gray-500">PNG, JPG or JPEG (max. {maxSize}MB)</p>
            
            <button 
              onClick={onButtonClick}
              disabled={isLoading}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Uploading...' : 'Select Image'}
            </button>
          </div>
        </div>
      )}
      
      {(localError || error) && (
        <p className="mt-2 text-sm text-red-600">{localError || error}</p>
      )}
    </div>
  );
}
