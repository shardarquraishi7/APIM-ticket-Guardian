import { useState, useEffect } from 'react';

interface ThinkingIndicatorProps {
  message: string;
  isVisible: boolean;
  className?: string;
}

/**
 * A component that displays a thinking indicator with animated dots
 * Used to show the AI is "thinking" during the delay
 */
export function ThinkingIndicator({ message, isVisible, className = '' }: ThinkingIndicatorProps) {
  const [dots, setDots] = useState('');
  
  useEffect(() => {
    if (!isVisible) return;
    
    // Animate the dots
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);
    
    return () => clearInterval(interval);
  }, [isVisible]);
  
  if (!isVisible) return null;
  
  return (
    <div className={`flex items-center space-x-2 text-gray-500 ${className}`}>
      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
        <svg 
          className="w-5 h-5 text-purple-600 animate-pulse" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
          />
        </svg>
      </div>
      <div>
        <p className="font-medium">{message}{dots}</p>
      </div>
    </div>
  );
}

/**
 * A component that displays a thinking indicator with a loading spinner
 * Alternative version with a different visual style
 */
export function ThinkingSpinner({ message, isVisible, className = '' }: ThinkingIndicatorProps) {
  const [dots, setDots] = useState('');
  
  useEffect(() => {
    if (!isVisible) return;
    
    // Animate the dots
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);
    
    return () => clearInterval(interval);
  }, [isVisible]);
  
  if (!isVisible) return null;
  
  return (
    <div className={`flex items-center space-x-3 p-3 rounded-lg bg-gray-50 ${className}`}>
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-700"></div>
      <p className="text-gray-700">{message}{dots}</p>
    </div>
  );
}
