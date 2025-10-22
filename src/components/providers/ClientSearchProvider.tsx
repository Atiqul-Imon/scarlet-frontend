"use client";
import * as React from 'react';
import { SearchProvider } from '../../lib/context/SearchContext';

interface ClientSearchProviderProps {
  children: React.ReactNode;
}

export default function ClientSearchProvider({ children }: ClientSearchProviderProps) {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Always render SearchProvider, but with different behavior based on client state
  return (
    <SearchProvider>
      {children}
    </SearchProvider>
  );
}
