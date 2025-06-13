import React, { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated' | 'telus';
}

/**
 * Enhanced Card component with TELUS branding and multiple variants
 */
const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantStyles = {
      default: 'rounded-lg border bg-card text-card-foreground shadow-sm',
      bordered: 'rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-card text-card-foreground',
      elevated: 'rounded-lg border-0 bg-card text-card-foreground shadow-lg',
      telus: 'rounded-lg border border-[#4B286D]/20 dark:border-[#6A3894]/30 bg-gradient-to-r from-[#F9F8FC]/90 to-[#F2EFF4]/90 dark:from-[#2A1540]/90 dark:to-[#3A1D54]/90 text-card-foreground shadow-md backdrop-blur-sm'
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          'transition-all duration-200',
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {/* Decorative elements for TELUS variant */}
        {variant === 'telus' && (
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-lg pointer-events-none">
            <div className="absolute top-0 left-0 w-20 h-1 bg-gradient-to-r from-transparent via-[#6A3894]/30 to-transparent"></div>
            <div className="absolute bottom-0 right-0 w-20 h-1 bg-gradient-to-r from-transparent via-[#4B286D]/30 to-transparent"></div>
            <div className="absolute top-2 right-2 size-2 rounded-full bg-[#6A3894]/20"></div>
            <div className="absolute bottom-2 left-2 size-2 rounded-full bg-[#4B286D]/20"></div>
          </div>
        )}
        {props.children}
      </div>
    );
  }
);
Card.displayName = 'Card';

/**
 * Enhanced Card header component with improved spacing
 */
const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

/**
 * Enhanced Card title component with TELUS styling
 */
const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'text-2xl font-semibold leading-none tracking-tight text-gray-900 dark:text-white',
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

/**
 * Enhanced Card description component with improved styling
 */
const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-gray-500 dark:text-gray-400', className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

/**
 * Enhanced Card content component with improved padding
 */
const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

/**
 * Enhanced Card footer component with improved styling
 */
const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0 border-t border-gray-100 dark:border-gray-800 mt-4', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
