'use client';

import { type VariantProps, cva } from 'class-variance-authority';
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/utils';

const buttonVariants = cva(
  'cursor-pointer inline-flex items-center gap-2 rounded-full transition-colors duration-200 ease-in-out',
  {
    variants: {
      variant: {
        default: 'border-gray-200 dark:border-gray-800',
        purple: 'bg-purple-900 text-purple-100 hover:bg-purple-800 hover:text-white',
        green: 'bg-green-900 text-green-100 hover:bg-green-800 hover:text-white',
      },
      appearance: {
        solid: '',
        outline: 'bg-transparent border-2',
      },
      size: {
        xs: 'text-xs px-2 py-1',
        sm: 'text-sm px-5 py-1',
        md: 'text-base px-4 py-2',
        lg: 'text-lg px-6 py-3',
      },
    },
    compoundVariants: [
      {
        variant: 'default',
        appearance: 'solid',
        className: 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700',
      },
      {
        variant: 'purple',
        appearance: 'solid',
        className: 'bg-purple-900 dark:bg-purple-800 hover:bg-purple-800 dark:hover:bg-purple-700',
      },
      {
        variant: 'green',
        appearance: 'solid',
        className: 'bg-green-900 dark:bg-green-800 hover:bg-green-800 dark:hover:bg-green-700',
      },
      {
        variant: 'default',
        appearance: 'outline',
        className:
          'border-gray-600 dark:border-gray-400 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
      },
      {
        variant: 'purple',
        appearance: 'outline',
        className:
          'border-purple-900 text-purple-900 dark:border-purple-600 dark:text-purple-600 hover:bg-purple-100 dark:hover:bg-gray-800',
      },
      {
        variant: 'green',
        appearance: 'outline',
        className:
          'border-green-900 text-green-900 dark:border-green-600 dark:text-green-600 hover:bg-green-100 dark:hover:bg-gray-800',
      },
    ],
    defaultVariants: {
      appearance: 'solid',
      variant: 'purple',
      size: 'md',
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    children: ReactNode;
    className?: string;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
  };

export const Button = ({
  children,
  className,
  leadingIcon,
  trailingIcon,
  variant,
  appearance,
  size,
  ...props
}: ButtonProps) => {
  return (
    <button className={cn(buttonVariants({ variant, appearance, size }), className)} {...props}>
      {leadingIcon}
      <span className="whitespace-no-wrap">{children}</span>
      {trailingIcon}
    </button>
  );
};
