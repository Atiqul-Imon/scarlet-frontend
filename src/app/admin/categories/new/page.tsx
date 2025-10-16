"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { useToast } from '@/lib/context';
import { categoryApi } from '@/lib/api';
import { CategoryTree as CategoryTreeType, Category } from '@/lib/types';

const categoryIcons = [
  '💇‍♀️', '🧪', '💧', '🧼', '🌊', '✨', '☀️', '💄', '🌿', 
  '🧴', '🛁', '🌸', '🔧', '🎨', '💋', '👁️', '🌟', '💎', '🎭', '🦋', '🌺'
];

export default function NewCategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingHierarchy, setLoadingHierarchy] = useState(true);
  const [hierarchy, setHierarchy] = useState<CategoryTreeType[]>([]);
  const [showParentSelector, setShowParentSelector] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '🌟',
    isActive: true,
    showInHomepage: false,
    sortOrder: 0,
    parentId: null as string | null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedParent, setSelectedParent] = useState<Category | null>(null);

  // Get parent ID from URL params
  const parentIdFromUrl = searchParams.get('parent');

  useEffect(() => {
    loadHierarchy();
  }, []);

  useEffect(() => {
    if (parentIdFromUrl) {
      setFormData(prev => ({ ...prev, parentId: parentIdFromUrl }));
      // Load parent category details
      loadParentCategory(parentIdFromUrl);
    }
  }, [parentIdFromUrl]);

  const loadHierarchy = async () => {
    try {
      setLoadingHierarchy(true);
      const hierarchyData = await categoryApi.getCategoryTree();
      setHierarchy(hierarchyData);
    } catch (error) {
      console.error('Error loading category hierarchy:', error);
      addToast({
        type: 'error',
        title: 'Failed to load categories',
        message: 'Could not load category hierarchy for parent selection.'
      });
    } finally {
      setLoadingHierarchy(false);
    }
  };

  const loadParentCategory = async (parentId: string) => {
    try {
      const parentCategory = await categoryApi.getCategoryAncestors(parentId);
      if (parentCategory.length > 0) {
        setSelectedParent(parentCategory[parentCategory.length - 1]);
      }
    } catch (error) {
      console.error('Error loading parent category:', error);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleParentSelect = (category: Category) => {
    setSelectedParent(category);
    setFormData(prev => ({ ...prev, parentId: category._id! }));
    setShowParentSelector(false);
  };

  const handleRemoveParent = () => {
    setSelectedParent(null);
    setFormData(prev => ({ ...prev, parentId: null }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Category slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    if (formData.sortOrder < 0) {
      newErrors.sortOrder = 'Sort order must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await categoryApi.createCategory(formData);
      addToast({
        type: 'success',
        title: 'Category created',
        message: 'The category has been created successfully.',
      });
      router.push('/admin/categories');
    } catch (error) {
      console.error('Error creating category:', error);
      addToast({
        type: 'error',
        title: 'Create failed',
        message: 'Failed to create category. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

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
                <h1 className="text-2xl font-bold text-gray-900">Create New Category</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleNameChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter category name"
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>

                {/* Category Slug */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Category Slug *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-500 ${
                      errors.slug ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="category-slug"
                  />
                  {errors.slug && <p className="text-red-500 text-sm">{errors.slug}</p>}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-500 resize-none"
                  placeholder="Enter category description"
                />
              </div>

              {/* Parent Category Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Parent Category
                </label>
                <div className="space-y-3">
                  {selectedParent ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{selectedParent.icon || '🌟'}</span>
                        <div>
                          <h4 className="font-medium text-green-900">{selectedParent.name}</h4>
                          <p className="text-sm text-green-700">
                            Level {selectedParent.level || 0} • {selectedParent.path || 'Root'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveParent}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-sm">No parent category selected</p>
                      <p className="text-xs text-gray-400 mt-1">This will be a root category</p>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => setShowParentSelector(!showParentSelector)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {selectedParent ? 'Change Parent' : 'Select Parent Category'}
                    </span>
                    {showParentSelector ? (
                      <ChevronUpIcon className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  
                  {showParentSelector && (
                    <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                      {loadingHierarchy ? (
                        <div className="p-4 text-center text-gray-500">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-700 mx-auto"></div>
                          <p className="mt-2 text-sm">Loading categories...</p>
                        </div>
                      ) : (
                        <div className="p-2">
                          <div className="space-y-1">
                            <button
                              type="button"
                              onClick={() => handleParentSelect({ _id: null, name: 'Root Category', slug: '', level: -1 } as Category)}
                              className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm text-gray-700"
                            >
                              🌟 Root Category (No Parent)
                            </button>
                            {hierarchy.map((category) => (
                              <CategoryTreeItem
                                key={category._id}
                                category={category}
                                onSelect={handleParentSelect}
                                level={0}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Visual Settings */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Visual Settings
              </h2>
              
              {/* Icon Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Category Icon
                </label>
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-11 gap-3 p-4 bg-gray-50 rounded-lg">
                  {categoryIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      className={`w-10 h-10 sm:w-12 sm:h-12 text-xl sm:text-2xl rounded-lg border-2 flex items-center justify-center transition-all duration-200 hover:scale-105 ${
                        formData.icon === icon
                          ? 'border-red-500 bg-red-50 shadow-md'
                          : 'border-gray-300 hover:border-gray-400 bg-white'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Settings
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sort Order */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    name="sortOrder"
                    value={formData.sortOrder}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 ${
                      errors.sortOrder ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.sortOrder && <p className="text-red-500 text-sm">{errors.sortOrder}</p>}
                </div>

                {/* Active Status */}
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-red-700 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Active
                  </label>
                </div>

                {/* Show in Homepage */}
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    name="showInHomepage"
                    checked={formData.showInHomepage}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-red-700 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Show in Homepage
                  </label>
                </div>
              </div>
            </div>

            {/* Category Preview */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Preview
              </h2>
              
              <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border">
                    <span className="text-3xl">{formData.icon}</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700">
                    {formData.name || 'Category Name'}
                  </h3>
                  {formData.description && (
                    <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
                      {formData.description}
                    </p>
                  )}
                  <div className="flex justify-center space-x-2 mt-4">
                    <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                      formData.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {formData.showInHomepage && (
                      <span className="inline-block px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                        Homepage
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/admin/categories"
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Category</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Helper component for category tree items in parent selector
interface CategoryTreeItemProps {
  category: CategoryTreeType;
  onSelect: (category: Category) => void;
  level: number;
}

const CategoryTreeItem: React.FC<CategoryTreeItemProps> = ({ category, onSelect, level }) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  const handleClick = () => {
    onSelect(category);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        className={`w-full text-left p-2 hover:bg-gray-50 rounded text-sm text-gray-700 flex items-center space-x-2 ${
          level > 0 ? `ml-${level * 4}` : ''
        }`}
      >
        {hasChildren && (
          <button
            type="button"
            onClick={handleToggle}
            className="p-1 hover:bg-gray-200 rounded"
          >
            {expanded ? (
              <ChevronDownIcon className="w-3 h-3 text-gray-500" />
            ) : (
              <ChevronRightIcon className="w-3 h-3 text-gray-500" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-5 h-5" />}
        <span className="text-sm">{category.icon || '🌟'}</span>
        <span className="flex-1 truncate">{category.name}</span>
        <span className="text-xs text-gray-500">L{category.level || 0}</span>
      </button>
      
      {expanded && hasChildren && (
        <div className="ml-4">
          {category.children!.map((child) => (
            <CategoryTreeItem
              key={child._id}
              category={child}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
