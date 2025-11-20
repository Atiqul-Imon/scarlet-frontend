"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '@/lib/context';
import { adminApi, categoryApi } from '@/lib/api';
import type { Category, CategoryTree as CategoryTreeType } from '@/lib/types';
import ImageSelector from '@/components/admin/ImageSelector';

const categoryIcons = [
  '💇‍♀️', '🧪', '💧', '🧼', '🌊', '✨', '☀️', '💄', '🌿', 
  '🧴', '🛁', '🌸', '🔧', '🎨', '💋', '👁️', '🌟', '💎', '🎭', '🦋', '🌺'
];

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingHierarchy, setLoadingHierarchy] = useState(true);
  const [category, setCategory] = useState<Category | null>(null);
  const [hierarchy, setHierarchy] = useState<CategoryTreeType[]>([]);
  const [showParentSelector, setShowParentSelector] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    icon: '',
    isActive: true,
    showInHomepage: false,
    sortOrder: 0,
    parentId: null as string | null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categoryId = params['id'] as string;

  useEffect(() => {
    if (categoryId) {
      loadCategory();
      loadHierarchy();
    }
  }, [categoryId]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      const categoryData = await adminApi.categories.getCategory(categoryId);
      setCategory(categoryData);
      
      // Load parent category if exists
      let parentCategory = null;
      if (categoryData.parentId) {
        try {
          const parentData = await categoryApi.getCategoryAncestors(categoryData.parentId);
          if (parentData.length > 0) {
            parentCategory = parentData[parentData.length - 1];
            setSelectedParent(parentCategory || null);
          }
        } catch (error) {
          console.error('Error loading parent category:', error);
        }
      }
      
      setFormData({
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description || '',
        image: categoryData.image || '',
        icon: categoryData.icon || '',
        isActive: categoryData.isActive !== false,
        showInHomepage: categoryData.showInHomepage || false,
        sortOrder: categoryData.sortOrder || 0,
        parentId: categoryData.parentId || null
      });
    } catch (error) {
      console.error('Failed to load category:', error);
      addToast({
        type: 'error',
        title: 'Failed to load category',
        message: 'Could not load category data. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const buildHierarchyFromFlatData = (categories: Category[]): CategoryTreeType[] => {
    const categoryMap = new Map<string, CategoryTreeType>();
    const rootCategories: CategoryTreeType[] = [];
    
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

  const loadHierarchy = async () => {
    try {
      setLoadingHierarchy(true);
      
      // Fetch both flat categories and tree structure
      const [categoriesResponse, treeResponse] = await Promise.all([
        categoryApi.getCategories({ fresh: true }),
        categoryApi.getCategoryTree()
      ]);
      
      const categoriesData = Array.isArray(categoriesResponse) ? categoriesResponse : [];
      const hierarchyData = Array.isArray(treeResponse) ? treeResponse : [];
      
      // Check if tree data has proper hierarchy, if not build it from flat data
      let processedTreeData = hierarchyData;
      const hasHierarchy = hierarchyData.some(cat => cat.children && cat.children.length > 0);
      
      if (!hasHierarchy && categoriesData.length > 0) {
        console.log('Tree API returned flat data, building hierarchy from flat data');
        processedTreeData = buildHierarchyFromFlatData(categoriesData);
      }
      
      setHierarchy(processedTreeData);
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

  const handleImageSelect = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, image: imageUrl }));
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

    if (!formData['name'].trim()) {
      newErrors['name'] = 'Category name is required';
    }

    if (!formData['slug'].trim()) {
      newErrors['slug'] = 'Category slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData['slug'])) {
      newErrors['slug'] = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    if (formData['sortOrder'] < 0) {
      newErrors['sortOrder'] = 'Sort order must be a positive number';
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
      await adminApi.categories.updateCategory(categoryId, formData);
      addToast({
        type: 'success',
        title: 'Category updated',
        message: 'The category has been updated successfully.',
      });
      router.push('/admin/categories');
    } catch (error) {
      console.error('Error updating category:', error);
      addToast({
        type: 'error',
        title: 'Update failed',
        message: 'Failed to update category. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading category...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
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
                      errors['name'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter category name"
                  />
                  {errors['name'] && <p className="text-red-500 text-sm">{errors['name']}</p>}
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
                      errors['slug'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="category-slug"
                  />
                  {errors['slug'] && <p className="text-red-500 text-sm">{errors['slug']}</p>}
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
                              onClick={() => handleParentSelect({ _id: '', name: 'Root Category', slug: '', level: -1 } as Category)}
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
                                currentCategoryId={categoryId}
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
              
              {/* Category Image Upload */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Category Image
                </label>
                
                {formData.image ? (
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="relative group">
                        <img
                          src={formData.image}
                          alt="Category"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex-1">
                      <ImageSelector
                        onImageSelect={handleImageSelect}
                        productSlug={formData.slug || 'category'}
                        buttonText="Change Image"
                      />
                    </div>
                  </div>
                ) : (
                  <ImageSelector
                    onImageSelect={handleImageSelect}
                    productSlug={formData.slug || 'category'}
                    buttonText="Add Category Image"
                  />
                )}
                
                <p className="text-xs text-gray-500">
                  Select from media gallery or upload a new image. Will be displayed on the homepage category section.
                </p>
              </div>

              {/* Icon Selection (Fallback) */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Category Icon (Fallback)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  This icon will be shown if no image is uploaded
                </p>
                
                {/* No Icon Selected Option */}
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon: '' }))}
                    className={`w-full px-4 py-3 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                      !formData.icon
                        ? 'border-red-500 bg-red-50 shadow-md'
                        : 'border-gray-300 hover:border-gray-400 bg-white'
                    }`}
                  >
                    <span className="text-gray-500 font-medium">
                      {formData.icon ? 'Clear Icon Selection' : 'No Icon Selected'}
                    </span>
                  </button>
                </div>
                
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
                      errors['sortOrder'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors['sortOrder'] && <p className="text-red-500 text-sm">{errors['sortOrder']}</p>}
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
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border overflow-hidden">
                    {formData.image ? (
                      <img
                        src={formData.image}
                        alt={formData.name || 'Category'}
                        className="w-full h-full object-cover"
                      />
                    ) : formData.icon ? (
                      <span className="text-3xl">{formData.icon}</span>
                    ) : (
                      <span className="text-gray-400 text-sm">No Icon</span>
                    )}
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
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Category</span>
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
  currentCategoryId?: string;
}

const CategoryTreeItem: React.FC<CategoryTreeItemProps> = ({ category, onSelect, level, currentCategoryId }) => {
  const [expanded, setExpanded] = useState(true); // Expanded by default to show all categories
  const hasChildren = category.children && category.children.length > 0;
  
  // Don't allow selecting the current category as its own parent
  const isCurrentCategory = currentCategoryId && category._id === currentCategoryId;
  const isDisabled = isCurrentCategory;

  const handleClick = () => {
    if (!isDisabled) {
      onSelect(category);
    }
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
        disabled={!!isDisabled}
        className={`w-full text-left p-2 hover:bg-gray-50 rounded text-sm text-gray-700 flex items-center space-x-2 ${
          level > 0 ? `ml-${level * 4}` : ''
        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
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
        {isDisabled && (
          <span className="text-xs text-red-500">(Current)</span>
        )}
      </button>
      
      {expanded && hasChildren && (
        <div className="ml-4">
          {category.children!.map((child) => (
            <CategoryTreeItem
              key={child._id}
              category={child}
              onSelect={onSelect}
              level={level + 1}
              currentCategoryId={currentCategoryId || ''}
            />
          ))}
        </div>
      )}
    </div>
  );
};
