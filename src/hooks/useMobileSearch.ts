"use client";
import * as React from 'react';
import { useSearch } from '../lib/context/SearchContext';

interface UseMobileSearchReturn {
  isOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
}

export function useMobileSearch(): UseMobileSearchReturn {
  const [isOpen, setIsOpen] = React.useState(false);
  const { clearRecentSearches } = useSearch();
  
  const openSearch = React.useCallback(() => {
    setIsOpen(true);
    // Prevent body scroll when search is open
    document.body.style.overflow = 'hidden';
  }, []);
  
  const closeSearch = React.useCallback(() => {
    setIsOpen(false);
    // Restore body scroll
    document.body.style.overflow = 'unset';
  }, []);
  
  const toggleSearch = React.useCallback(() => {
    if (isOpen) {
      closeSearch();
    } else {
      openSearch();
    }
  }, [isOpen, openSearch, closeSearch]);
  
  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeSearch();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, closeSearch]);
  
  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  
  return {
    isOpen,
    openSearch,
    closeSearch,
    toggleSearch,
  };
}
