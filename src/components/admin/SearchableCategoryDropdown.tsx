'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Category, CategoryTree } from '@/lib/types';

interface SearchableCategoryDropdownProps {
  categories: Category[];
  value: string;
  onChange: (categoryId: string) => void;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

interface CategoryTreeItem extends CategoryTree {
  expanded?: boolean;
  depth?: number;
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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build hierarchical category tree
  const categoryTree = useMemo(() => {
    const buildTree = (parentId: string | null | undefined = null, depth = 0): CategoryTreeItem[] => {
      return categories
        .filter(cat => cat.parentId === parentId)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        .map(cat => {
          const children = buildTree(cat._id, depth + 1);
          return {
            ...cat,
            children,
            depth,
            expanded: expandedCategories.has(cat._id || '')
          } as CategoryTreeItem;
        });
    };

    return buildTree();
  }, [categories, expandedCategories]);

  // Flatten tree for search with hierarchy info
  const flattenTree = (tree: CategoryTreeItem[], result: CategoryTreeItem[] = []): CategoryTreeItem[] => {
    tree.forEach(item => {
      result.push(item);
      if (item.children && item.children.length > 0) {
        flattenTree(item.children as CategoryTreeItem[], result);
      }
    });
    return result;
  };

  // Get filtered categories based on search
  const filteredTree = useMemo(() => {
    if (!searchTerm.trim()) {
      return categoryTree;
    }

    const searchLower = searchTerm.toLowerCase();
    const allCategories = flattenTree(categoryTree);
    const matchingCategories = allCategories.filter(cat =>
      cat.name.toLowerCase().includes(searchLower)
    );

    // Build tree with matching categories and their parents/children
    const matchingIds = new Set(matchingCategories.map(cat => cat._id));
    
    const buildFilteredTree = (
      items: CategoryTreeItem[],
      parentPath: CategoryTreeItem[] = []
    ): CategoryTreeItem[] => {
      return items
        .map(item => {
          const currentPath = [...parentPath, item];
          const children = item.children ? buildFilteredTree(item.children as CategoryTreeItem[], currentPath) : [];
          
          // Include if:
          // 1. Category matches search
          // 2. Has matching children
          // 3. Is a parent of a matching category
          const matchesSearch = matchingIds.has(item._id || '');
          const hasMatchingChildren = children.length > 0;
          const isParentOfMatch = parentPath.length > 0 && matchingIds.has(item._id || '');

          if (matchesSearch || hasMatchingChildren || isParentOfMatch) {
            // Auto-expand parent categories when searching
            if (matchesSearch && parentPath.length > 0) {
              parentPath.forEach(p => expandedCategories.add(p._id || ''));
              setExpandedCategories(new Set(expandedCategories));
            }

            return {
              ...item,
              children: hasMatchingChildren ? children : item.children,
              expanded: expandedCategories.has(item._id || '') || hasMatchingChildren
            } as CategoryTreeItem;
          }
          return null;
        })
        .filter((item): item is CategoryTreeItem => item !== null);
    };

    return buildFilteredTree(categoryTree);
  }, [categoryTree, searchTerm, expandedCategories]);

  // Get selected category with full path
  const selectedCategoryPath = useMemo(() => {
    if (!value) return null;

    const findCategoryPath = (
      items: CategoryTreeItem[],
      targetId: string,
      path: CategoryTreeItem[] = []
    ): CategoryTreeItem[] | null => {
      for (const item of items) {
        const newPath = [...path, item];
        if (item._id === targetId) {
          return newPath;
        }
        if (item.children && item.children.length > 0) {
          const found = findCategoryPath(item.children as CategoryTreeItem[], targetId, newPath);
          if (found) return found;
        }
      }
      return null;
    };

    return findCategoryPath(categoryTree, value);
  }, [categoryTree, value]);

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

  const handleToggleExpand = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Auto-expand all when searching
    if (e.target.value.trim()) {
      const allIds = new Set(flattenTree(categoryTree).map(cat => cat._id || ''));
      setExpandedCategories(allIds);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const renderCategoryItem = (category: CategoryTreeItem): React.ReactNode => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category._id || '');
    const isSelected = value === category._id;
    const depth = category.depth || 0;

    return (
      <div key={category._id} className="select-none">
        <div
          className={`flex items-center px-3 py-2 text-sm transition-colors hover:bg-gray-50 ${
            isSelected ? 'bg-red-50 text-red-700 font-medium' : 'text-gray-900'
          } ${depth > 0 ? 'cursor-pointer' : ''}`}
          style={{ paddingLeft: `${12 + depth * 20}px` }}
        >
          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => handleToggleExpand(category._id || '', e)}
              className="mr-2 w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded transition-colors"
            >
              <svg
                className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <span className="mr-2 w-5 h-5" /> // Spacer for alignment
          )}

          {/* Category Icon */}
          {category.icon && (
            <span className="mr-2 text-base">{category.icon}</span>
          )}

          {/* Category Name with Hierarchy Indicator */}
          <button
            type="button"
            onClick={() => handleCategorySelect(category._id || '')}
            className="flex-1 text-left flex items-center gap-2"
          >
            <span className="truncate">{category.name}</span>
            {depth > 0 && (
              <span className="text-xs text-gray-400">
                ({category.path?.split('/').pop() || category.slug})
              </span>
            )}
          </button>

          {/* Selection Indicator */}
          {isSelected && (
            <svg className="w-4 h-4 text-red-600 ml-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="bg-gray-50/50">
            {(category.children as CategoryTreeItem[]).map(child => renderCategoryItem(child))}
          </div>
        )}
      </div>
    );
  };

  const selectedCategory = categories.find(cat => cat._id === value);
  const displayText = selectedCategoryPath
    ? selectedCategoryPath.map(cat => cat.name).join(' > ')
    : selectedCategory?.name || placeholder;

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
          <div className="flex-1 min-w-0">
            <span className={`block truncate ${selectedCategory ? 'text-gray-900' : 'text-gray-500'}`}>
              {loading ? 'Loading categories...' : displayText}
            </span>
            {selectedCategoryPath && selectedCategoryPath.length > 1 && (
              <span className="block text-xs text-gray-400 mt-0.5 truncate">
                {selectedCategoryPath.map(cat => cat.name).slice(0, -1).join(' > ')}
              </span>
            )}
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-2 ${
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
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-96 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                placeholder="Search categories..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
              />
            </div>
            {searchTerm && (
              <p className="mt-2 text-xs text-gray-500">
                Showing matching categories and their hierarchy
              </p>
            )}
          </div>

          {/* Category Tree */}
          <div className="max-h-80 overflow-y-auto">
            {filteredTree.length === 0 ? (
              <div className="px-4 py-8 text-sm text-gray-500 text-center">
                <svg
                  className="w-12 h-12 mx-auto mb-2 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {searchTerm ? `No categories found matching "${searchTerm}"` : 'No categories available'}
              </div>
            ) : (
              <div className="py-1">
                {filteredTree.map((category) => renderCategoryItem(category))}
              </div>
            )}
          </div>

          {/* Footer with info */}
          {filteredTree.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
              <div className="flex items-center justify-between">
                <span>
                  {searchTerm
                    ? `${flattenTree(filteredTree).length} matching ${flattenTree(filteredTree).length === 1 ? 'category' : 'categories'}`
                    : `${categories.length} total ${categories.length === 1 ? 'category' : 'categories'}`}
                </span>
                <span className="text-gray-400">
                  {selectedCategory ? '✓ Selected' : 'Click to select'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading categories...
        </p>
      )}
    </div>
  );
};

export default SearchableCategoryDropdown;
