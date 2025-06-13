import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' | 'telus';
  size?: 'default' | 'sm' | 'lg';
  withDot?: boolean;
}

/**
 * Enhanced Badge component with additional variants, sizes, and a status dot option
 */
function Badge({
  className,
  variant = 'default',
  size = 'default',
  withDot = false,
  children,
  ...props
}: BadgeProps) {
  // Enhanced variant styles with additional options
  const variantStyles = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
    outline: 'text-foreground border border-input bg-transparent',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border border-green-200 dark:border-green-800',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    telus: 'bg-[#F2EFF4] text-[#4B286D] dark:bg-[#3A1D54] dark:text-[#D2C5E2] border border-[#4B286D]/20 dark:border-[#6A3894]/30'
  };

  // Size variations
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5',
    default: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1'
  };

  // Status dot colors based on variant
  const dotColors = {
    default: 'bg-white',
    secondary: 'bg-secondary-foreground',
    destructive: 'bg-white',
    outline: 'bg-foreground',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
    telus: 'bg-[#4B286D]'
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium transition-all shadow-sm',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {withDot && (
        <span 
          className={cn(
            'size-1.5 rounded-full',
            dotColors[variant]
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge };
