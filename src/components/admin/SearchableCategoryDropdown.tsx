'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Category } from '@/lib/types';

interface SearchableCategoryDropdownProps {
  categories: Category[];
  value: string;
  onChange: (categoryId: string) => void;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const SearchableCategoryDropdown: React.FC<SearchableCategoryDropdownProps> = ({
  categories,
  value,
  onChange,
  loading = false,
  disabled = false,
  placeholder = 'Select Category'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<Category[]>(categories);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter categories based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [searchTerm, categories]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled && !loading) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
      }
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    onChange(categoryId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const selectedCategory = categories.find(cat => cat._id === value);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled || loading}
        className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-left text-gray-900 placeholder-gray-500 bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
          isOpen ? 'ring-2 ring-red-500 border-transparent' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={selectedCategory ? 'text-gray-900' : 'text-gray-500'}>
            {loading ? 'Loading categories...' : selectedCategory ? selectedCategory.name : placeholder}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              placeholder="Search categories..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Category List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredCategories.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                {searchTerm ? 'No categories found' : 'No categories available'}
              </div>
            ) : (
              filteredCategories.map((category) => (
                <button
                  key={category._id}
                  type="button"
                  onClick={() => handleCategorySelect(category._id)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                    value === category._id ? 'bg-red-50 text-red-700' : 'text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{category.name}</span>
                    {value === category._id && (
                      <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer with count */}
          {filteredCategories.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
              {filteredCategories.length} of {categories.length} categories
              {searchTerm && ` matching "${searchTerm}"`}
            </div>
          )}
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <p className="text-xs text-gray-500 mt-1">Loading categories from database...</p>
      )}
    </div>
  );
};

export default SearchableCategoryDropdown;
