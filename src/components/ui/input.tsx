import * as React from 'react';
import { InputType } from '../../lib/types';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  type?: InputType;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'error' | 'success';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  label?: string;
  autoComplete?: string;
}

const inputSizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-4 text-base',
} as const;

const inputVariants = {
  default: 'border-gray-300 focus:border-red-500 focus:ring-red-500',
  error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
  success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
} as const;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className = '', 
    type = 'text', 
    size = 'md',
    variant = 'default',
    leftIcon,
    rightIcon,
    error,
    helperText,
    fullWidth = false,
    disabled,
    label,
    ...props 
  }, ref) => {
    const hasError = Boolean(error);
    const currentVariant = hasError ? 'error' : variant;

    const baseClasses = [
      'block',
      'rounded-lg',
      'border',
      'transition-colors',
      'duration-200',
      'text-gray-900',
      'bg-white',
      'placeholder:text-gray-400',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-0',
      'disabled:bg-gray-50',
      'disabled:text-gray-500',
      'disabled:cursor-not-allowed',
      'disabled:opacity-60',
    ];

    const classes = [
      ...baseClasses,
      inputSizes[size],
      inputVariants[currentVariant],
      fullWidth ? 'w-full' : '',
      leftIcon && 'pl-10',
      rightIcon && 'pr-10',
      className,
    ].filter(Boolean).join(' ');

    const inputElement = (
      <input
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled}
        aria-invalid={hasError}
        aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
        {...props}
      />
    );

    const wrapperClasses = fullWidth ? 'w-full' : '';
    
    if (leftIcon || rightIcon) {
      return (
        <div className={wrapperClasses}>
          {label && (
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </label>
          )}
          <div className="relative">
            {leftIcon && (
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-400">
                  {leftIcon}
                </span>
              </div>
            )}
            {inputElement}
            {rightIcon && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-400">
                  {rightIcon}
                </span>
              </div>
            )}
          </div>
          {error && (
            <p id={`${props.id}-error`} className="mt-1 text-sm text-red-600">
              {error}
            </p>
          )}
          {helperText && !error && (
            <p id={`${props.id}-helper`} className="mt-1 text-sm text-gray-500">
              {helperText}
            </p>
          )}
        </div>
      );
    }

    return (
      <div className={wrapperClasses}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        {inputElement}
        {error && (
          <p id={`${props.id}-error`} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${props.id}-helper`} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
