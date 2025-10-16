import * as React from 'react';
import { ButtonVariant, ButtonSize } from '../../lib/types';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-red-700 text-white hover:bg-red-800 focus:ring-red-500 disabled:bg-red-300',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 disabled:bg-gray-50 disabled:text-gray-400',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 disabled:text-gray-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-green-300',
} as const;

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  xl: 'h-14 px-8 text-lg',
} as const;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className = '', 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    children,
    ...props 
  }, ref) => {
    const baseClasses = [
      'inline-flex',
      'items-center',
      'justify-center',
      'whitespace-nowrap',
      'rounded-lg',
      'font-medium',
      'transition-all',
      'duration-200',
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed',
      'disabled:opacity-60',
    ];

    const classes = [
      ...baseClasses,
      buttonSizes[size],
      buttonVariants[variant],
      fullWidth && 'w-full',
      className,
    ].filter(Boolean).join(' ');

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={classes}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <LoadingSpinner className="mr-2" />
        )}
        {!loading && leftIcon && (
          <span className="mr-2 flex-shrink-0">
            {leftIcon}
          </span>
        )}
        <span className={loading ? 'opacity-70' : undefined}>
          {children}
        </span>
        {!loading && rightIcon && (
          <span className="ml-2 flex-shrink-0">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Loading Spinner Component
interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

function LoadingSpinner({ className = '', size = 'md' }: LoadingSpinnerProps): JSX.Element {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="status"
      aria-label="Loading"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}


