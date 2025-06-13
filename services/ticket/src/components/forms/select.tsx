import { type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = ({ className, error, options, ...props }: SelectProps) => {
  return (
    <div className="w-full">
      <select
        className={cn(
          'form-select w-full rounded-lg border border-gray-300 bg-white/90 px-4 py-3 text-gray-900 shadow-sm transition-colors focus:border-purple-800 focus:outline-none focus:ring-1 focus:ring-purple-800 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-100',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

Select.displayName = 'Select';
