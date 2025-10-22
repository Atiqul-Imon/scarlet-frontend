"use client";

import * as React from 'react';
import { 
  ExclamationTriangleIcon, 
  XCircleIcon, 
  InformationCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export interface ErrorInfo {
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  details?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  onDismiss?: () => void;
}

interface ErrorDisplayProps {
  error: ErrorInfo | null;
  className?: string;
}

export default function ErrorDisplay({ error, className = "" }: ErrorDisplayProps) {
  const [isDismissed, setIsDismissed] = React.useState(false);

  React.useEffect(() => {
    if (error) {
      setIsDismissed(false);
    }
  }, [error]);

  if (!error || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    error.onDismiss?.();
  };

  const getIcon = () => {
    switch (error.type) {
      case 'error':
        return <XCircleIcon className="w-6 h-6 text-red-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />;
      case 'info':
        return <InformationCircleIcon className="w-6 h-6 text-blue-600" />;
      case 'success':
        return <CheckCircleIcon className="w-6 h-6 text-green-600" />;
      default:
        return <ExclamationTriangleIcon className="w-6 h-6 text-gray-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (error.type) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = () => {
    switch (error.type) {
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      case 'success':
        return 'text-green-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getBackgroundColor()} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${getTextColor()}`}>
            {error.title}
          </h3>
          <div className={`mt-2 text-sm ${getTextColor()}`}>
            <p>{error.message}</p>
            {error.details && (
              <details className="mt-2">
                <summary className="cursor-pointer hover:underline">
                  Technical Details
                </summary>
                <pre className="mt-2 text-xs bg-white/50 p-2 rounded border overflow-x-auto">
                  {error.details}
                </pre>
              </details>
            )}
          </div>
          {error.action && (
            <div className="mt-3">
              <button
                onClick={error.action.onClick}
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${
                  error.type === 'error' 
                    ? 'text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                    : error.type === 'warning'
                    ? 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500'
                    : error.type === 'info'
                    ? 'text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    : 'text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                }`}
              >
                {error.action.label}
              </button>
            </div>
          )}
        </div>
        {error.dismissible && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={handleDismiss}
                className={`inline-flex rounded-md p-1.5 ${
                  error.type === 'error' 
                    ? 'text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600'
                    : error.type === 'warning'
                    ? 'text-yellow-500 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600'
                    : error.type === 'info'
                    ? 'text-blue-500 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-600'
                    : 'text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600'
                }`}
              >
                <span className="sr-only">Dismiss</span>
                <XCircleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to create user-friendly error messages
export function createUserFriendlyError(error: any, context: string = 'operation'): ErrorInfo {
  // Network errors
  if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
    return {
      type: 'error',
      title: 'Connection Problem',
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
      details: error.message,
      action: {
        label: 'Retry',
        onClick: () => window.location.reload()
      }
    };
  }

  // Authentication errors
  if (error?.status === 401 || error?.message?.includes('unauthorized')) {
    return {
      type: 'error',
      title: 'Access Denied',
      message: 'Your session has expired. Please log in again to continue.',
      details: error.message,
      action: {
        label: 'Go to Login',
        onClick: () => window.location.href = '/login'
      }
    };
  }

  // Permission errors
  if (error?.status === 403 || error?.message?.includes('forbidden')) {
    return {
      type: 'error',
      title: 'Permission Denied',
      message: 'You don\'t have permission to perform this action. Contact your administrator for access.',
      details: error.message
    };
  }

  // Server errors
  if (error?.status >= 500) {
    return {
      type: 'error',
      title: 'Server Error',
      message: 'Something went wrong on our end. Our team has been notified and is working to fix it.',
      details: error.message,
      action: {
        label: 'Try Again',
        onClick: () => window.location.reload()
      }
    };
  }

  // Validation errors
  if (error?.status === 400 || error?.message?.includes('validation')) {
    return {
      type: 'warning',
      title: 'Invalid Information',
      message: 'Please check the information you entered and try again.',
      details: error.message
    };
  }

  // Not found errors
  if (error?.status === 404) {
    return {
      type: 'warning',
      title: 'Not Found',
      message: 'The item you\'re looking for doesn\'t exist or has been removed.',
      details: error.message,
      action: {
        label: 'Go Back',
        onClick: () => window.history.back()
      }
    };
  }

  // Generic error
  return {
    type: 'error',
    title: `${context} Failed`,
    message: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
    details: error?.message || 'Unknown error',
    action: {
      label: 'Retry',
      onClick: () => window.location.reload()
    }
  };
}
