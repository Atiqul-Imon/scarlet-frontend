"use client";
import * as React from 'react';
import { categoryApi } from '../../../lib/api';
import type { Category, CategoryTree } from '../../../lib/types';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ChevronRightIcon, 
  ChevronDownIcon,
  FolderIcon,
  FolderOpenIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [categoryTree, setCategoryTree] = React.useState<CategoryTree[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Hierarchy view state
  const [viewMode, setViewMode] = React.useState<'grid' | 'hierarchy'>('hierarchy');
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set());
  
  // Delete state
  const [deletingCategory, setDeletingCategory] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchCategories();
  }, []);


  const getCategoryIcon = (category: Category) => {
    // Use the icon from the database if available, otherwise show null
    if (category.icon) {
      return category.icon;
    }
    return null;
  };

  // Build hierarchy from flat category data
  const buildHierarchyFromFlatData = (categories: Category[]): CategoryTree[] => {
    const categoryMap = new Map<string, CategoryTree>();
    const rootCategories: CategoryTree[] = [];
    
    // Create map of all categories
    categories.forEach(category => {
      if (category._id) {
        categoryMap.set(category._id, { ...category, children: [] });
      }
    });
    
    // Build tree structure
    categories.forEach(category => {
      if (!category._id) return;
      const categoryTree = categoryMap.get(category._id);
      if (!categoryTree) return;
      
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(categoryTree);
          parent.hasChildren = true;
          parent.childrenCount = (parent.childrenCount || 0) + 1;
        }
      } else {
        rootCategories.push(categoryTree);
      }
    });
    
    return rootCategories;
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Fetch both flat categories and tree structure
      const [categoriesResponse, treeResponse] = await Promise.all([
        categoryApi.getCategories(),
        categoryApi.getCategoryTree()
      ]);
      
      const categoriesData = Array.isArray(categoriesResponse) ? categoriesResponse : [];
      const treeData = Array.isArray(treeResponse) ? treeResponse : [];
      
      // Check if tree data has proper hierarchy, if not build it from flat data
      let processedTreeData = treeData;
      const hasHierarchy = treeData.some(cat => cat.children && cat.children.length > 0);
      
      if (!hasHierarchy && categoriesData.length > 0) {
        processedTreeData = buildHierarchyFromFlatData(categoriesData);
      }
      
      setCategories(categoriesData.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
      setCategoryTree(processedTreeData);
      
      // Auto-expand root categories by default
      const rootCategoryIds = new Set(processedTreeData.map(cat => cat._id).filter((id): id is string => Boolean(id)));
      setExpandedCategories(rootCategoryIds);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setMessage({ type: 'error', text: 'Failed to load categories' });
    } finally {
      setLoading(false);
    }
  };

  // Hierarchy view helper functions
  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const expandAllCategories = () => {
    const allCategoryIds = new Set<string>();
    const collectIds = (categories: CategoryTree[]) => {
      categories.forEach(cat => {
        if (cat._id) {
          allCategoryIds.add(cat._id);
        }
        if (cat.children && cat.children.length > 0) {
          collectIds(cat.children);
        }
      });
    };
    collectIds(categoryTree);
    setExpandedCategories(allCategoryIds);
  };

  const collapseAllCategories = () => {
    const rootCategoryIds = new Set(categoryTree.map(cat => cat._id).filter((id): id is string => Boolean(id)));
    setExpandedCategories(rootCategoryIds);
  };


  const updateHomepageVisibility = async (categoryId: string) => {
    try {
      setUpdating(categoryId);
      const category = categories.find(cat => cat._id === categoryId);
      if (!category) return;

      // Toggle isActive status
      const newStatus = !category.isActive;
      
      // Call backend API to update category
      await categoryApi.updateCategory(categoryId, {
        isActive: newStatus
      });
      
      // Update local state after successful API call
      setCategories(prev => 
        prev.map(cat => 
          cat._id === categoryId 
            ? { ...cat, isActive: newStatus }
            : cat
        )
      );

      setMessage({ 
        type: 'success', 
        text: `Category ${newStatus ? 'activated' : 'deactivated'} successfully` 
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error updating category status:', error);
      setMessage({ type: 'error', text: 'Failed to update category status' });
      
      // Refresh categories on error to ensure consistency
      fetchCategories();
    } finally {
      setUpdating(null);
    }
  };


  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingCategory(categoryId);
      
      // Call the backend API to delete the category
      await categoryApi.deleteCategory(categoryId);
      
      // Refresh categories after successful deletion
      await fetchCategories();
      
      setMessage({ type: 'success', text: 'Category deleted successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting category:', error);
      setMessage({ type: 'error', text: 'Failed to delete category' });
    } finally {
      setDeletingCategory(null);
    }
  };

  // Helper function to find parent category
  const findParentCategory = (categoryId: string): Category | null => {
    const findInTree = (categories: CategoryTree[], targetId: string): CategoryTree | null => {
      for (const cat of categories) {
        if (cat.children) {
          for (const child of cat.children) {
            if (child._id === targetId) {
              return cat;
            }
            const found = findInTree([child], targetId);
            if (found) return found;
          }
        }
      }
      return null;
    };
    return findInTree(categoryTree, categoryId);
  };

  // Hierarchy Category Item Component
  const HierarchyCategoryItem: React.FC<{
    category: CategoryTree;
    level: number;
    parentPath?: string[];
  }> = ({ category, level, parentPath = [] }) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category._id!);
    const isUpdating = updating === category._id;
    const isDeleting = deletingCategory === category._id;
    const parentCategory = level > 0 ? findParentCategory(category._id!) : null;

    return (
      <div className="relative">
        {/* Tree Lines */}
        {level > 0 && (
          <div className="absolute left-0 top-0 bottom-0 w-6 flex">
            {/* Vertical line */}
            <div className="w-0.5 bg-gray-300 ml-3"></div>
            {/* Horizontal line */}
            <div className="absolute top-6 left-3 w-3 h-0.5 bg-gray-300"></div>
          </div>
        )}

        <div 
          className={`relative flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
            level === 0 ? 'bg-white border-l-4 border-l-blue-500' : 
            level === 1 ? 'bg-gray-50 border-l-4 border-l-green-500' :
            level === 2 ? 'bg-gray-25 border-l-4 border-l-purple-500' :
            'bg-gray-25 border-l-4 border-l-orange-500'
          }`}
          style={{ marginLeft: `${level * 32}px` }}
        >
          {/* Expand/Collapse Button */}
          <div className="flex-shrink-0 w-8 flex justify-center">
            {hasChildren ? (
              <button
                onClick={() => toggleCategoryExpansion(category._id!)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors bg-white rounded-full shadow-sm border border-gray-200"
              >
                {isExpanded ? (
                  <ChevronDownIcon className="w-4 h-4" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4" />
                )}
              </button>
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
            )}
          </div>

          {/* Category Icon/Image */}
          <div className="flex-shrink-0">
            <div 
              className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-sm border-2 overflow-hidden ${
                level === 0 ? 'border-blue-200' :
                level === 1 ? 'border-green-200' :
                level === 2 ? 'border-purple-200' :
                'border-orange-200'
              } ${
                category.isActive 
                  ? 'bg-green-100 hover:bg-green-200' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => updateHomepageVisibility(category._id!)}
            >
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              ) : getCategoryIcon(category) ? (
                <span className="text-xl">
                  {getCategoryIcon(category)}
                </span>
              ) : (
                <span className="text-gray-400 text-xs">No Icon</span>
              )}
            </div>
          </div>

          {/* Category Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 flex-wrap">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {category.name}
              </h3>
              
              {/* Parent Category Info */}
              {parentCategory && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">under</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {parentCategory.name}
                  </span>
                </div>
              )}
              
              {/* Level Indicator */}
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                level === 0 ? 'bg-blue-100 text-blue-800' :
                level === 1 ? 'bg-green-100 text-green-800' :
                level === 2 ? 'bg-purple-100 text-purple-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {level === 0 ? 'Root' : `Level ${level}`}
              </span>
              
              {/* Children Count */}
              {hasChildren && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  <FolderOpenIcon className="w-3 h-3 mr-1" />
                  {category.childrenCount || category.children?.length || 0}
                </span>
              )}
            </div>
            
            {/* Breadcrumb Path */}
            {parentPath.length > 0 && (
              <div className="flex items-center space-x-1 mt-1">
                <span className="text-xs text-gray-400">Path:</span>
                {parentPath.map((path, index) => (
                  <span key={index} className="text-xs text-gray-500">
                    {path}
                    {index < parentPath.length - 1 && <span className="mx-1">›</span>}
                  </span>
                ))}
                <span className="text-xs text-gray-700 font-medium">{category.name}</span>
              </div>
            )}
            
            {category.description && (
              <p className="text-sm text-gray-600 mt-1 truncate">
                {category.description}
              </p>
            )}
            
            {/* Full Path */}
            {category.path && (
              <p className="text-xs text-gray-400 mt-1 font-mono bg-gray-100 px-2 py-1 rounded">
                {category.path}
              </p>
            )}
          </div>

          {/* Status Badges */}
          <div className="flex-shrink-0 flex items-center space-x-2">
            <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
              category.isActive 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}>
              {category.isActive ? 'Active' : 'Inactive'}
            </span>
            
            {category.showInHomepage && (
              <span className="inline-block px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800 border border-blue-200 font-medium">
                Homepage
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0 flex items-center space-x-1">
            {isUpdating && (
              <div className="w-4 h-4 border-2 border-red-700 border-t-transparent rounded-full animate-spin"></div>
            )}
            
            <Link
              href={`/admin/categories/${category._id}/edit`}
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit category"
            >
              <PencilIcon className="w-4 h-4" />
            </Link>
            
            <button
              onClick={() => handleDeleteCategory(category._id!)}
              disabled={isDeleting}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title="Delete category"
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <TrashIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="relative">
            {/* Debug: Rendering children for ${category.name} */}
            {category.children!.map((child) => (
              <HierarchyCategoryItem
                key={child._id}
                category={child}
                level={level + 1}
                parentPath={[...parentPath, category.name]}
              />
            ))}
          </div>
        )}
        
        {/* Debug info for categories with children but not expanded */}
        {hasChildren && !isExpanded && (
          <div className="text-xs text-gray-400 ml-4">
            (Has {category.children!.length} children - click to expand)
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
        </div>
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-16 h-6 bg-gray-200 rounded"></div>
                  <div className="w-12 h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-600 mt-1">
            Manage category hierarchy with parent-child relationships. Click on category icons to toggle visibility.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('hierarchy')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'hierarchy'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Hierarchy
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Grid
            </button>
          </div>

          {/* Stats */}
          <div className="bg-green-50 px-4 py-2 rounded-lg">
            <span className="text-sm font-medium text-green-800">
              {categories.filter(cat => cat.isActive).length} Active Categories
            </span>
          </div>

          {/* Add Category */}
          <Link
            href="/admin/categories/new"
            className="flex items-center space-x-2 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Category</span>
          </Link>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Hierarchy Controls */}
      {viewMode === 'hierarchy' && (
        <div className="mb-6 space-y-4">
          {/* Main Controls */}
          <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Category Hierarchy ({categories.length} total)
              </h2>
              <span className="text-sm text-gray-600">
                Root categories: {categoryTree.length}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={expandAllCategories}
                className="px-3 py-1 text-sm bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Expand All
              </button>
              <button
                onClick={collapseAllCategories}
                className="px-3 py-1 text-sm bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Debug Info */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-yellow-800 mb-2">Debug Info</h3>
            <div className="text-xs text-yellow-700 space-y-1">
              <p>Categories with children: {categoryTree.filter(cat => cat.children && cat.children.length > 0).length}</p>
              <p>Total categories: {categories.length}</p>
              <p>Root categories: {categoryTree.length}</p>
              {categoryTree.slice(0, 3).map(cat => (
                <p key={cat._id}>
                  {cat.name}: {cat.children?.length || 0} children
                  {cat.children && cat.children.length > 0 && ` (${cat.children.map(c => c.name).join(', ')})`}
                </p>
              ))}
            </div>
          </div>

          {/* Hierarchy Legend */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Hierarchy Legend</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Root Categories</p>
                  <p className="text-xs text-gray-500">Top-level categories</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-green-200 flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Level 1</p>
                  <p className="text-xs text-gray-500">Direct children of root</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-purple-200 flex items-center justify-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Level 2</p>
                  <p className="text-xs text-gray-500">Sub-categories</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-orange-200 flex items-center justify-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Level 3+</p>
                  <p className="text-xs text-gray-500">Deep nesting</p>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center space-x-6 text-xs text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                    <ChevronRightIcon className="w-3 h-3" />
                  </div>
                  <span>Collapsed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                    <ChevronDownIcon className="w-3 h-3" />
                  </div>
                  <span>Expanded</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                  <span>No children</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-lg shadow">
        {viewMode === 'hierarchy' ? (
          /* Hierarchy View */
          <div className="divide-y divide-gray-200">
            {categoryTree.length > 0 ? (
              categoryTree.map((category) => (
                <HierarchyCategoryItem
                  key={category._id}
                  category={category}
                  level={0}
                />
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <FolderIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories Found</h3>
                <p className="text-gray-500 mb-4">Get started by creating your first category.</p>
                <Link
                  href="/admin/categories/new"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Create Category</span>
                </Link>
              </div>
            )}
          </div>
        ) : (
          /* Grid View (Original) */
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className="group text-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
                >
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors duration-300 cursor-pointer ${
                      category.isActive 
                        ? 'bg-green-100 hover:bg-green-200' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    onClick={() => updateHomepageVisibility(category._id!)}
                  >
                    <span className="text-xl">
                      {getCategoryIcon(category)}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2 truncate">
                    {category.name}
                  </h3>
                  <div className="flex items-center justify-center space-x-1">
                    <Link
                      href={`/admin/categories/${category._id}/edit`}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      title="Edit category"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteCategory(category._id!)}
                      disabled={deletingCategory === category._id}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      title="Delete category"
                    >
                      {deletingCategory === category._id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <TrashIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {updating === category._id && (
                    <div className="mt-2">
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-red-700"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}