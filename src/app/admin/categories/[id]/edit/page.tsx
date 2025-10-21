"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '@/lib/context';
import { adminApi } from '@/lib/api';
import type { Category } from '@/lib/types';
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
  const [category, setCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    icon: '',
    isActive: true,
    showInHomepage: false,
    sortOrder: 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categoryId = params['id'] as string;

  useEffect(() => {
    if (categoryId) {
      loadCategory();
    }
  }, [categoryId]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      const categoryData = await adminApi.categories.getCategory(categoryId);
      setCategory(categoryData);
      setFormData({
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description || '',
        image: categoryData.image || '',
        icon: categoryData.icon || '',
        isActive: categoryData.isActive !== false,
        showInHomepage: categoryData.showInHomepage || false,
        sortOrder: categoryData.sortOrder || 0
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
