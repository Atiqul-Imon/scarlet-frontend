'use client';

import React, { useState, useMemo } from 'react';
import { Category, CategoryTree } from '@/lib/types';

interface CategoryCheckboxSelectorProps {
  categories: Category[];
  selectedCategoryIds: string[];
  onChange: (categoryIds: string[]) => void;
  loading?: boolean;
  disabled?: boolean;
}

interface CategoryTreeItem extends CategoryTree {
  expanded?: boolean;
  depth?: number;
}

const CategoryCheckboxSelector: React.FC<CategoryCheckboxSelectorProps> = ({
  categories,
  selectedCategoryIds,
  onChange,
  loading = false,
  disabled = false
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

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

  // Flatten tree for search
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

    const matchingIds = new Set(matchingCategories.map(cat => cat._id));
    
    const buildFilteredTree = (
      items: CategoryTreeItem[],
      parentPath: CategoryTreeItem[] = []
    ): CategoryTreeItem[] => {
      return items
        .map(item => {
          const currentPath = [...parentPath, item];
          const children = item.children ? buildFilteredTree(item.children as CategoryTreeItem[], currentPath) : [];
          
          const matchesSearch = matchingIds.has(item._id || '');
          const hasMatchingChildren = children.length > 0;
          const isParentOfMatch = parentPath.length > 0 && matchingIds.has(item._id || '');

          if (matchesSearch || hasMatchingChildren || isParentOfMatch) {
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

  const handleCategoryToggle = (categoryId: string) => {
    if (disabled) return;
    
    const newSelected = selectedCategoryIds.includes(categoryId)
      ? selectedCategoryIds.filter(id => id !== categoryId)
      : [...selectedCategoryIds, categoryId];
    
    onChange(newSelected);
  };

  const handleSelectAll = () => {
    if (disabled) return;
    const allIds = flattenTree(filteredTree).map(cat => cat._id || '').filter(Boolean);
    onChange(allIds);
  };

  const handleDeselectAll = () => {
    if (disabled) return;
    onChange([]);
  };

  const renderCategoryItem = (category: CategoryTreeItem): React.ReactNode => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category._id || '');
    const isSelected = selectedCategoryIds.includes(category._id || '');
    const depth = category.depth || 0;

    return (
      <div key={category._id} className="select-none">
        <div
          className={`flex items-center px-3 py-2 text-sm transition-colors hover:bg-gray-50 ${
            isSelected ? 'bg-red-50' : ''
          }`}
          style={{ paddingLeft: `${12 + depth * 20}px` }}
        >
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleCategoryToggle(category._id || '')}
            disabled={disabled}
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 focus:ring-2 cursor-pointer disabled:cursor-not-allowed"
          />

          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => handleToggleExpand(category._id || '', e)}
              className="ml-2 mr-2 w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded transition-colors"
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
            <span className="ml-2 mr-2 w-5 h-5" />
          )}

          {/* Category Icon */}
          {category.icon && (
            <span className="mr-2 text-base">{category.icon}</span>
          )}

          {/* Category Name */}
          <label
            className="flex-1 cursor-pointer flex items-center gap-2"
            onClick={() => handleCategoryToggle(category._id || '')}
          >
            <span className={`truncate ${isSelected ? 'font-medium text-red-700' : 'text-gray-900'}`}>
              {category.name}
            </span>
            {depth > 0 && (
              <span className="text-xs text-gray-400">
                ({category.path?.split('/').pop() || category.slug})
              </span>
            )}
          </label>
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

  const selectedCount = selectedCategoryIds.length;
  const allFilteredIds = flattenTree(filteredTree).map(cat => cat._id || '').filter(Boolean);
  const allSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedCategoryIds.includes(id));

  return (
    <div className="border border-gray-300 rounded-lg bg-white">
      {/* Search and Actions Bar */}
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 mb-2">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search categories..."
              disabled={disabled || loading}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white disabled:bg-gray-100"
            />
          </div>
          <button
            type="button"
            onClick={allSelected ? handleDeselectAll : handleSelectAll}
            disabled={disabled || loading || filteredTree.length === 0}
            className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        {selectedCount > 0 && (
          <div className="text-xs text-gray-600 mt-2">
            <span className="font-medium text-red-600">{selectedCount}</span> categor{selectedCount === 1 ? 'y' : 'ies'} selected
          </div>
        )}
      </div>

      {/* Category Tree */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="px-4 py-8 text-sm text-gray-500 text-center">
            <svg className="animate-spin h-5 w-5 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading categories...
          </div>
        ) : filteredTree.length === 0 ? (
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

      {/* Footer */}
      {!loading && filteredTree.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <span>
              {searchTerm
                ? `${flattenTree(filteredTree).length} matching ${flattenTree(filteredTree).length === 1 ? 'category' : 'categories'}`
                : `${categories.length} total ${categories.length === 1 ? 'category' : 'categories'}`}
            </span>
            {selectedCount > 0 && (
              <span className="text-red-600 font-medium">
                {selectedCount} selected
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryCheckboxSelector;

