import * as React from 'react';
import { SelectOption } from '../../lib/types';

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[];
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'error' | 'success';
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

const selectSizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-4 text-base',
} as const;

const selectVariants = {
  default: 'border-gray-300 focus:border-pink-500 focus:ring-pink-500',
  error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
  success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
} as const;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className = '', 
    options,
    placeholder,
    size = 'md',
    variant = 'default',
    error,
    helperText,
    fullWidth = false,
    disabled,
    ...props 
  }, ref) => {
    const hasError = Boolean(error);
    const currentVariant = hasError ? 'error' : variant;

    const baseClasses = [
      'block',
      'rounded-lg',
      'border',
      'bg-white',
      'transition-colors',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-0',
      'disabled:bg-gray-50',
      'disabled:text-gray-500',
      'disabled:cursor-not-allowed',
      'disabled:opacity-60',
      'appearance-none',
      'bg-no-repeat',
      'bg-right',
      'pr-10',
    ];

    const classes = [
      ...baseClasses,
      selectSizes[size],
      selectVariants[currentVariant],
      fullWidth ? 'w-full' : '',
      className,
    ].filter(Boolean).join(' ');

    // Group options by group if they have groups
    const groupedOptions = React.useMemo(() => {
      const grouped: Record<string, SelectOption[]> = {};
      const ungrouped: SelectOption[] = [];

      options.forEach(option => {
        if (option.group) {
          if (!grouped[option.group]) {
            grouped[option.group] = [];
          }
          grouped[option.group].push(option);
        } else {
          ungrouped.push(option);
        }
      });

      return { grouped, ungrouped };
    }, [options]);

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        <div className="relative">
          <select
            ref={ref}
            className={classes}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundSize: '1.5em 1.5em',
            }}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            
            {/* Render ungrouped options */}
            {groupedOptions.ungrouped.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
            
            {/* Render grouped options */}
            {Object.entries(groupedOptions.grouped).map(([groupName, groupOptions]) => (
              <optgroup key={groupName} label={groupName}>
                {groupOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
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
);

Select.displayName = 'Select';
