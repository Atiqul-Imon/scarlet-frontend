"use client";
import * as React from 'react';

interface UseMobileSearchReturn {
  isOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
}

export function useMobileSearch(): UseMobileSearchReturn {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const openSearch = React.useCallback(() => {
    setIsOpen(true);
    // Don't prevent body scroll to allow bottom navigation to remain visible
    // document.body.style.overflow = 'hidden';
  }, []);
  
  const closeSearch = React.useCallback(() => {
    setIsOpen(false);
    // No need to restore body scroll since we're not setting it
    // document.body.style.overflow = 'unset';
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
      // No need to restore body scroll since we're not setting it
      // document.body.style.overflow = 'unset';
    };
  }, []);
  
  return {
    isOpen,
    openSearch,
    closeSearch,
    toggleSearch,
  };
}
