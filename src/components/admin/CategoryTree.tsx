'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronRightIcon, 
  ChevronDownIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  FolderIcon,
  FolderOpenIcon
} from '@heroicons/react/24/outline';
import { CategoryTree as CategoryTreeType, Category } from '@/lib/types';
import { categoryApi } from '@/lib/api';
import Link from 'next/link';

interface CategoryTreeProps {
  categories: CategoryTreeType[];
  onCategorySelect?: (category: Category) => void;
  onCategoryEdit?: (category: Category) => void;
  onCategoryDelete?: (category: Category) => void;
  onCategoryAdd?: (parentId?: string) => void;
  selectedCategoryId?: string;
  level?: number;
  maxLevel?: number;
}

const CategoryTree: React.FC<CategoryTreeProps> = ({
  categories,
  onCategorySelect,
  onCategoryEdit,
  onCategoryDelete,
  onCategoryAdd,
  selectedCategoryId,
  level = 0,
  maxLevel = 5
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [loadingCategories, setLoadingCategories] = useState<Set<string>>(new Set());

  const toggleExpanded = async (categoryId: string, hasChildren: boolean) => {
    if (!hasChildren) return;

    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategoryClick = (category: Category) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  const handleEdit = (e: React.MouseEvent, category: Category) => {
    e.stopPropagation();
    if (onCategoryEdit) {
      onCategoryEdit(category);
    }
  };

  const handleDelete = (e: React.MouseEvent, category: Category) => {
    e.stopPropagation();
    if (onCategoryDelete) {
      onCategoryDelete(category);
    }
  };

  const handleAdd = (e: React.MouseEvent, parentId?: string) => {
    e.stopPropagation();
    if (onCategoryAdd) {
      onCategoryAdd(parentId);
    }
  };

  const getIndentClass = (level: number) => {
    return `ml-${level * 4}`;
  };

  const getLevelColor = (level: number) => {
    const colors = [
      'text-gray-900',      // Level 0
      'text-blue-700',      // Level 1
      'text-green-700',     // Level 2
      'text-purple-700',    // Level 3
      'text-orange-700',    // Level 4
      'text-pink-700',      // Level 5+
    ];
    return colors[Math.min(level, colors.length - 1)];
  };

  const getLevelIcon = (level: number) => {
    const icons = ['🌟', '📁', '📂', '🗂️', '📋', '📄'];
    return icons[Math.min(level, icons.length - 1)];
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FolderIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No categories found</p>
        {level === 0 && onCategoryAdd && (
          <button
            onClick={(e) => handleAdd(e)}
            className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4 inline mr-2" />
            Add Root Category
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {categories.map((category) => {
        const isExpanded = expandedCategories.has(category._id!);
        const isSelected = selectedCategoryId === category._id;
        const hasChildren = category.hasChildren || (category.children && category.children.length > 0);
        const canAddChild = level < maxLevel - 1;

        return (
          <div key={category._id} className="select-none">
            <div
              className={`
                flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200
                hover:bg-gray-50 group
                ${isSelected ? 'bg-pink-50 border border-pink-200' : 'hover:shadow-sm'}
                ${getIndentClass(level)}
              `}
              onClick={() => handleCategoryClick(category)}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {/* Expand/Collapse Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(category._id!, hasChildren);
                  }}
                  className={`
                    p-1 rounded transition-colors
                    ${hasChildren ? 'hover:bg-gray-200' : 'invisible'}
                  `}
                  disabled={!hasChildren}
                >
                  {hasChildren ? (
                    isExpanded ? (
                      <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                    )
                  ) : (
                    <div className="w-4 h-4" />
                  )}
                </button>

                {/* Category Icon */}
                <div className="flex-shrink-0">
                  <span className="text-lg">
                    {category.icon || getLevelIcon(level)}
                  </span>
                </div>

                {/* Category Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className={`font-medium truncate ${getLevelColor(level)}`}>
                      {category.name}
                    </h3>
                    {category.level !== undefined && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        L{category.level}
                      </span>
                    )}
                  </div>
                  
                  {category.description && (
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {category.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      category.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                    
                    {category.showInHomepage && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        Homepage
                      </span>
                    )}
                    
                    {category.childrenCount && category.childrenCount > 0 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                        {category.childrenCount} subcategories
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {canAddChild && onCategoryAdd && (
                  <button
                    onClick={(e) => handleAdd(e, category._id)}
                    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                    title="Add subcategory"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                )}
                
                {onCategoryEdit && (
                  <Link
                    href={`/admin/categories/${category._id}/edit`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit category"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Link>
                )}
                
                {onCategoryDelete && (
                  <button
                    onClick={(e) => handleDelete(e, category)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete category"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Children */}
            {isExpanded && hasChildren && category.children && (
              <div className="mt-1">
                <CategoryTree
                  categories={category.children}
                  onCategorySelect={onCategorySelect}
                  onCategoryEdit={onCategoryEdit}
                  onCategoryDelete={onCategoryDelete}
                  onCategoryAdd={onCategoryAdd}
                  selectedCategoryId={selectedCategoryId}
                  level={level + 1}
                  maxLevel={maxLevel}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CategoryTree;
