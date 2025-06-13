import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'telus' | 'telus-outline';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xl';
  asChild?: boolean;
  isLoading?: boolean;
}

/**
 * Enhanced Button component with TELUS branding, animations, and loading state
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', isLoading = false, children, disabled, ...props }, ref) => {
    // Base styles for all buttons
    const baseStyles = 'relative inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';
    
    // Variant styles with TELUS branding
    const variantStyles = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
      outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'underline-offset-4 hover:underline text-primary p-0 h-auto',
      // TELUS branded variants
      telus: 'bg-[#4B286D] text-white hover:bg-[#3A1D54] shadow-md hover:shadow-lg border border-[#4B286D]',
      'telus-outline': 'border-2 border-[#4B286D] text-[#4B286D] hover:bg-[#4B286D]/10 hover:text-[#3A1D54]'
    };
    
    // Size styles with additional xl size
    const sizeStyles = {
      default: 'h-10 py-2 px-4 text-sm',
      sm: 'h-9 px-3 rounded-md text-xs',
      lg: 'h-11 px-8 rounded-md text-base',
      xl: 'h-12 px-10 rounded-lg text-lg',
      icon: 'h-10 w-10'
    };
    
    // Loading spinner component
    const LoadingSpinner = () => (
      <svg 
        className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        ></circle>
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    );
    
    return (
      <button
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          isLoading && 'cursor-wait',
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <LoadingSpinner />}
        {children}
        
        {/* Ripple effect overlay for TELUS variants */}
        {(variant === 'telus' || variant === 'telus-outline') && (
          <span className="absolute inset-0 overflow-hidden rounded-md pointer-events-none">
            <span className="absolute inset-0 rounded-md bg-gradient-to-tr from-white/5 to-transparent opacity-0 hover:opacity-10 transition-opacity duration-300"></span>
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
