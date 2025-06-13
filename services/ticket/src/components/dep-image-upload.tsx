'use client';

import React, { useState } from 'react';
import { ImageUpload } from './image-upload';
import { ImagePreview } from './image-preview';
import { UploadedImage } from '@/ai/handlers/dep-handler';

interface DEPImageUploadProps {
  questionId: string;
  onImagesUploaded?: (images: UploadedImage[]) => void;
  maxImages?: number;
}

export function DEPImageUpload({
  questionId,
  onImagesUploaded,
  maxImages = 5
}: DEPImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  
  const handleImageSelected = async (fileOrError: File | Error) => {
    // Check if we received an error from the image upload component
    if (fileOrError instanceof Error) {
      setError(fileOrError.message);
      return;
    }
    
    const file = fileOrError as File;
    
    if (uploadedImages.length >= maxImages) {
      setError(`Maximum of ${maxImages} images allowed`);
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('questionId', questionId);
      
      // Upload the image
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }
      
      const data = await response.json();
      
      // Add the uploaded image to the list
      const newImage: UploadedImage = {
        url: data.fileUrl,
        fileName: data.fileName,
        filePath: data.filePath
      };
      
      const updatedImages = [...uploadedImages, newImage];
      setUploadedImages(updatedImages);
      
      // Notify parent component
      if (onImagesUploaded) {
        onImagesUploaded(updatedImages);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleRemoveImage = (index: number) => {
    const updatedImages = [...uploadedImages];
    updatedImages.splice(index, 1);
    setUploadedImages(updatedImages);
    
    // Notify parent component
    if (onImagesUploaded) {
      onImagesUploaded(updatedImages);
    }
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Data Flow Diagrams</h3>
      <p className="text-sm text-gray-600">
        Upload clear, high-resolution data flow diagrams showing storage and processing in this initiative.
        Include legend explaining encryption and directional arrows.
      </p>
      
      {/* Display uploaded images */}
      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {uploadedImages.map((image, index) => (
            <ImagePreview
              key={index}
              imageUrl={image.url}
              fileName={image.fileName}
              onRemove={() => handleRemoveImage(index)}
            />
          ))}
        </div>
      )}
      
      {/* Show upload component if under the limit */}
      {uploadedImages.length < maxImages && (
        <ImageUpload
          onImageSelected={handleImageSelected}
          isLoading={isUploading}
          error={error || undefined}
          maxSize={10} // 10MB
        />
      )}
      
      {/* Show message if max images reached */}
      {uploadedImages.length >= maxImages && (
        <p className="text-sm text-amber-600">
          Maximum number of images ({maxImages}) reached. Remove an image to upload a new one.
        </p>
      )}
    </div>
  );
}
