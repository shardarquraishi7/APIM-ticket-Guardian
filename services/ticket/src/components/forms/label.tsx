import { type LabelHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  error?: boolean;
}

export const Label = ({ className, error, children, ...props }: LabelProps) => {
  return (
    <label
      className={cn(
        'mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200',
        error && 'text-red-500',
        className,
      )}
      {...props}
    >
      {children}
    </label>
  );
};

Label.displayName = 'Label';
