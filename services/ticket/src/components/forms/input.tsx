import { type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = ({ className, error, type = 'text', ...props }: InputProps) => {
  return (
    <div className="w-full">
      <input
        type={type}
        className={cn(
          'form-input w-full rounded-lg border border-gray-300 bg-white/90 px-4 py-3 text-gray-900 shadow-sm transition-colors focus:border-purple-800 focus:outline-none focus:ring-1 focus:ring-purple-800 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-100',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className,
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

Input.displayName = 'Input';
