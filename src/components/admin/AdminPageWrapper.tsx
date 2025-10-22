"use client";

import * as React from 'react';
import ErrorDisplay, { createUserFriendlyError, ErrorInfo } from './ErrorDisplay';
import LoadingState, { LoadingCard } from './LoadingState';

interface AdminPageWrapperProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  loading?: boolean;
  error?: any;
  onRetry?: () => void;
  className?: string;
}

export default function AdminPageWrapper({
  children,
  title,
  description,
  loading = false,
  error = null,
  onRetry,
  className = ""
}: AdminPageWrapperProps) {
  if (loading) {
    return (
      <div className={`p-6 space-y-6 ${className}`}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-gray-600 mt-1">{description}</p>
          )}
        </div>
        <LoadingCard 
          title={`Loading ${title}`}
          message="Please wait while we fetch the data..."
        />
      </div>
    );
  }

  if (error) {
    const errorInfo: ErrorInfo = {
      ...createUserFriendlyError(error, title),
      action: onRetry ? {
        label: 'Try Again',
        onClick: onRetry
      } : undefined
    };

    return (
      <div className={`p-6 space-y-6 ${className}`}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-gray-600 mt-1">{description}</p>
          )}
        </div>
        <ErrorDisplay error={errorInfo} />
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="text-gray-600 mt-1">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// Hook for managing page state
export function useAdminPageState() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<any>(null);

  const executeWithErrorHandling = React.useCallback(async <T>(
    operation: () => Promise<T>,
    options?: {
      onSuccess?: (result: T) => void;
      onError?: (error: any) => void;
      showLoading?: boolean;
    }
  ): Promise<T | null> => {
    try {
      if (options?.showLoading !== false) {
        setLoading(true);
      }
      setError(null);
      
      const result = await operation();
      
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (err) {
      setError(err);
      if (options?.onError) {
        options.onError(err);
      }
      return null;
    } finally {
      if (options?.showLoading !== false) {
        setLoading(false);
      }
    }
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const retry = React.useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return {
    loading,
    error,
    setLoading,
    setError,
    executeWithErrorHandling,
    clearError,
    retry
  };
}
