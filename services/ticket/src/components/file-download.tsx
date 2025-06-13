'use client';

import React from 'react';
import { Button } from './button';

interface FileDownloadProps {
  filePath: string;
  fileName: string;
  isLoading?: boolean;
  error?: string;
}

export function FileDownload({ filePath, fileName, isLoading = false, error }: FileDownloadProps) {
  const handleDownload = async () => {
    try {
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
    } catch (err) {
      console.error('Error downloading file:', err);
    }
  };
  
  return (
    <div className="w-full flex flex-col items-center">
      <Button
        onClick={handleDownload}
        disabled={isLoading}
        variant="purple"
        className="mt-2"
        leadingIcon={
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className="w-5 h-5"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" 
            />
          </svg>
        }
      >
        {isLoading ? 'Preparing Download...' : 'Download Completed DEP File'}
      </Button>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
