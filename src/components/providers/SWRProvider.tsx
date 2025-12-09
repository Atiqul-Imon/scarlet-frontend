'use client';

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';
import logger from '@/lib/logger';

interface SWRProviderProps {
  children: ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        // Global SWR configuration
        revalidateOnFocus: false,      // Don't refetch on window focus by default
        revalidateOnReconnect: true,   // Refetch when internet reconnects
        shouldRetryOnError: true,      // Retry on errors
        errorRetryCount: 3,            // Max 3 retries
        errorRetryInterval: 5000,      // 5 seconds between retries
        
        // Success/Error handlers
        onSuccess: (data, key, config) => {
          // Optional: Log successful fetches in development
          logger.info('[SWR] Fetched', { key });
        },
        
        onError: (error, key, config) => {
          // Optional: Log errors
          if (process.env.NODE_ENV === 'development') {
            console.error(`[SWR] ❌ Error fetching ${key}:`, error.message);
          }
        },
        
        // Custom cache provider (optional - uses Map by default)
        // We're using the default in-memory cache which is perfect for most cases
      }}
    >
      {children}
    </SWRConfig>
  );
}


