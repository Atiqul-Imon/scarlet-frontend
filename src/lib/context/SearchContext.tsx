"use client";
import * as React from 'react';
import { fetchJson } from '../api';

interface SearchSuggestion {
  products: Array<{
    _id: string;
    title: string;
    slug: string;
    brand: string;
    price: { amount: number; currency: string };
    images: string[];
    rating?: { average: number; count: number };
  }>;
  brands: string[];
  categories: string[];
}

interface SearchContextType {
  getSearchSuggestions: (query: string) => Promise<SearchSuggestion | null>;
}

const SearchContext = React.createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  
  
  const getSearchSuggestions = React.useCallback(async (query: string): Promise<SearchSuggestion | null> => {
    if (!query || query.trim().length < 2) {
      return null;
    }
    
    try {
      // Only fetch on client side
      if (typeof window === 'undefined') {
        return null;
      }
      
      const suggestions = await fetchJson<SearchSuggestion>(`/catalog/search/suggestions?q=${encodeURIComponent(query.trim())}`);
      return suggestions;
    } catch (error) {
      console.error('Failed to fetch search suggestions:', error);
      return null;
    }
  }, []);
  
  
  const value: SearchContextType = {
    getSearchSuggestions
  };
  
  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = React.useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}

// Hook for search analytics
export function useSearchAnalytics() {
  const trackSearch = React.useCallback((query: string, results: number) => {
    // Track search analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'search', {
        search_term: query,
        results_count: results
      });
    }
  }, []);
  
  const trackSearchSuggestion = React.useCallback((query: string, suggestion: string) => {
    // Track suggestion clicks
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'search_suggestion_click', {
        search_term: query,
        suggestion: suggestion
      });
    }
  }, []);
  
  return {
    trackSearch,
    trackSearchSuggestion
  };
}
