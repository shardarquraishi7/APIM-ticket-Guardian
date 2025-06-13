import React, { createContext, useContext, useId, useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Create context for tabs
type TabsContextValue = {
  value: string;
  onValueChange: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a TabsProvider');
  }
  return context;
}

// Tabs component props
interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (value: string) => void;
  defaultValue?: string;
  variant?: 'default' | 'underline' | 'pills' | 'telus';
}

/**
 * Enhanced Tabs component with animations and multiple style variants
 */
function Tabs({ 
  value, 
  onValueChange, 
  defaultValue, 
  className, 
  variant = 'default',
  children, 
  ...props 
}: TabsProps) {
  const contextValue = { value, onValueChange };

  return (
    <TabsContext.Provider value={contextValue}>
      <div 
        className={cn(
          'w-full',
          className
        )} 
        data-variant={variant}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// TabsList component props
interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  fullWidth?: boolean;
}

/**
 * Enhanced TabsList component with multiple style variants
 */
function TabsList({ className, fullWidth = false, ...props }: TabsListProps) {
  // Get the variant from the parent Tabs component using dataset
  const variant = (props as any)?.['data-variant'] || 'default';
  
  const variantStyles = {
    default: 'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
    underline: 'inline-flex h-10 items-center justify-center border-b border-gray-200 dark:border-gray-700',
    pills: 'inline-flex h-10 items-center justify-center gap-1 p-1',
    telus: 'inline-flex h-10 items-center justify-center rounded-md bg-[#F2EFF4]/50 dark:bg-[#2A1540]/50 p-1 text-[#4B286D] dark:text-[#D2C5E2]'
  };
  
  return (
    <div
      role="tablist"
      className={cn(
        variantStyles[variant as keyof typeof variantStyles],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    />
  );
}

// TabsTrigger component props
interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

/**
 * Enhanced TabsTrigger component with animations and multiple style variants
 */
function TabsTrigger({ className, value, ...props }: TabsTriggerProps) {
  const { value: selectedValue, onValueChange } = useTabs();
  const isSelected = selectedValue === value;
  
  // Get the variant from the parent Tabs component using dataset
  const variant = (props as any)?.['data-variant'] || 'default';
  
  const variantStyles = {
    default: {
      base: 'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      active: 'bg-background text-foreground shadow-sm',
      inactive: 'text-muted-foreground hover:bg-muted hover:text-foreground'
    },
    underline: {
      base: 'inline-flex items-center justify-center whitespace-nowrap px-3 py-2 text-sm font-medium border-b-2 border-transparent transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
      active: 'border-b-2 border-primary text-foreground',
      inactive: 'text-muted-foreground hover:text-foreground hover:border-gray-300 dark:hover:border-gray-600'
    },
    pills: {
      base: 'inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-1 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
      active: 'bg-primary text-primary-foreground shadow-sm',
      inactive: 'text-muted-foreground hover:bg-muted hover:text-foreground'
    },
    telus: {
      base: 'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
      active: 'bg-[#4B286D] text-white shadow-sm',
      inactive: 'text-[#4B286D] dark:text-[#D2C5E2] hover:bg-[#4B286D]/10 hover:text-[#4B286D]'
    }
  };
  
  const currentVariant = variantStyles[variant as keyof typeof variantStyles];

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isSelected}
      data-state={isSelected ? 'active' : 'inactive'}
      className={cn(
        currentVariant.base,
        isSelected ? currentVariant.active : currentVariant.inactive,
        className
      )}
      onClick={() => onValueChange(value)}
      {...props}
    >
      {props.children}
      
      {/* Animated indicator for underline variant */}
      {variant === 'underline' && isSelected && (
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
          layoutId="underline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </button>
  );
}

// TabsContent component props
interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

/**
 * Enhanced TabsContent component with smooth animations
 */
function TabsContent({ className, value, ...props }: TabsContentProps) {
  const { value: selectedValue } = useTabs();
  const isSelected = selectedValue === value;

  // Only render when selected to avoid animation issues
  if (!isSelected) return null;
  
  return (
    <div
      role="tabpanel"
      data-state={isSelected ? 'active' : 'inactive'}
      className={cn(
        'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
