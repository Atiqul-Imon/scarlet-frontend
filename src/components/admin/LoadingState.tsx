"use client";

import * as React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingState({ 
  message = "Loading...", 
  size = 'md',
  className = "" 
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <div className="flex items-center space-x-3">
        <ArrowPathIcon className={`${sizeClasses[size]} animate-spin text-red-600`} />
        <span className={`${textSizeClasses[size]} text-gray-600`}>{message}</span>
      </div>
    </div>
  );
}

interface LoadingCardProps {
  title?: string;
  message?: string;
  className?: string;
}

export function LoadingCard({ 
  title = "Loading", 
  message = "Please wait while we fetch the data...",
  className = "" 
}: LoadingCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
    </div>
  );
}

interface LoadingGridProps {
  count?: number;
  className?: string;
}

export function LoadingGrid({ count = 6, className = "" }: LoadingGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
