'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  PlusIcon,
  ViewColumnsIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { useToast } from '@/lib/context';
import { categoryApi } from '@/lib/api';
import { CategoryTree as CategoryTreeType, Category, CategoryHierarchy } from '@/lib/types';
import CategoryTree from '@/components/admin/CategoryTree';

export default function CategoryHierarchyPage() {
  const router = useRouter();
  const { addToast } = useToast();
  
  const [hierarchy, setHierarchy] = useState<CategoryHierarchy | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<number | 'all'>('all');
  const [expandedAll, setExpandedAll] = useState(false);

  useEffect(() => {
    loadHierarchy();
  }, []);

  const loadHierarchy = async () => {
    try {
      setLoading(true);
      const hierarchyData = await categoryApi.getCategoryHierarchy();
      setHierarchy(hierarchyData);
    } catch (error) {
      console.error('Error loading category hierarchy:', error);
      addToast({
        type: 'error',
        title: 'Failed to load categories',
        message: 'Could not load category hierarchy. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleCategoryEdit = (category: Category) => {
    router.push(`/admin/categories/${category._id}/edit`);
  };

  const handleCategoryDelete = async (category: Category) => {
    if (!window.confirm(`Are you sure you want to delete "${category.name}" and all its subcategories? This action cannot be undone.`)) {
      return;
    }

    try {
      await categoryApi.deleteCategory(category._id!);
      addToast({
        type: 'success',
        title: 'Category deleted',
        message: `"${category.name}" has been deleted successfully.`
      });
      loadHierarchy(); // Reload the hierarchy
    } catch (error) {
      console.error('Error deleting category:', error);
      addToast({
        type: 'error',
        title: 'Delete failed',
        message: 'Failed to delete category. Please try again.'
      });
    }
  };

  const handleCategoryAdd = (parentId?: string) => {
    const url = parentId 
      ? `/admin/categories/new?parent=${parentId}`
      : '/admin/categories/new';
    router.push(url);
  };

  const filteredCategories = React.useMemo(() => {
    if (!hierarchy) return [];
    
    let filtered = hierarchy.allCategories;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(category => 
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by level
    if (filterLevel !== 'all') {
      filtered = filtered.filter(category => category.level === filterLevel);
    }
    
    return filtered;
  }, [hierarchy, searchQuery, filterLevel]);

  const toggleExpandAll = () => {
    setExpandedAll(!expandedAll);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href="/admin/categories"
                  className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Back to Categories
                </Link>
                <div className="h-6 w-px bg-gray-300"></div>
                <h1 className="text-2xl font-bold text-gray-900">Category Hierarchy</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleCategoryAdd()}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Add Root Category</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters and Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              {/* View Mode Toggle */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">View Mode</h3>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setViewMode('tree')}
                    className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium transition-colors ${
                      viewMode === 'tree'
                        ? 'bg-red-700 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Bars3Icon className="w-4 h-4 mr-2" />
                    Tree
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium transition-colors ${
                      viewMode === 'list'
                        ? 'bg-red-700 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ViewColumnsIcon className="w-4 h-4 mr-2" />
                    List
                  </button>
                </div>
              </div>

              {/* Search */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Search</h3>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Level Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Filter by Level</h3>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">All Levels</option>
                  {hierarchy && Array.from({ length: hierarchy.maxLevel + 1 }, (_, i) => (
                    <option key={i} value={i}>Level {i}</option>
                  ))}
                </select>
              </div>

              {/* Hierarchy Stats */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Statistics</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Total Categories:</span>
                    <span className="font-medium">{hierarchy?.allCategories.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Root Categories:</span>
                    <span className="font-medium">{hierarchy?.rootCategories.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Depth:</span>
                    <span className="font-medium">{hierarchy?.maxLevel || 0}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={toggleExpandAll}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {expandedAll ? 'Collapse All' : 'Expand All'}
                  </button>
                  <button
                    onClick={loadHierarchy}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Refresh Hierarchy
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {viewMode === 'tree' ? (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-gray-900">Category Tree</h2>
                    <div className="text-sm text-gray-500">
                      {hierarchy?.rootCategories.length || 0} root categories
                    </div>
                  </div>
                  
                  <CategoryTree
                    categories={hierarchy?.rootCategories || []}
                    onCategorySelect={handleCategorySelect}
                    onCategoryEdit={handleCategoryEdit}
                    onCategoryDelete={handleCategoryDelete}
                    onCategoryAdd={handleCategoryAdd}
                    selectedCategoryId={selectedCategory?._id}
                    maxLevel={hierarchy?.maxLevel || 5}
                  />
                </div>
              ) : (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-gray-900">Category List</h2>
                    <div className="text-sm text-gray-500">
                      {filteredCategories.length} categories
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {filteredCategories.map((category) => (
                      <div
                        key={category._id}
                        className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedCategory?._id === category._id
                            ? 'border-red-200 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => handleCategorySelect(category)}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{category.icon || '🌟'}</span>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-900">{category.name}</h3>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                L{category.level || 0}
                              </span>
                            </div>
                            {category.description && (
                              <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                            )}
                            <div className="flex items-center space-x-2 mt-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                category.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {category.isActive ? 'Active' : 'Inactive'}
                              </span>
                              {category.path && (
                                <span className="text-xs text-gray-500">
                                  {category.path}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCategoryEdit(category);
                            }}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {filteredCategories.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No categories found matching your criteria.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
