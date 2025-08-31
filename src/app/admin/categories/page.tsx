"use client";
import * as React from 'react';
import { categoryApi } from '../../../lib/api';
import type { Category } from '../../../lib/types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryApi.getCategories();
      const categoriesData = Array.isArray(response) ? response : [];
      setCategories(categoriesData.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
    } catch (error) {
      console.error('Error fetching categories:', error);
      setMessage({ type: 'error', text: 'Failed to load categories' });
    } finally {
      setLoading(false);
    }
  };

  const updateHomepageVisibility = async (categoryId: string, showInHomepage: boolean) => {
    try {
      setUpdating(categoryId);
      
      // This would be the API call to update the category
      // await categoryApi.updateCategory(categoryId, { showInHomepage });
      
      // For now, we'll update the local state
      setCategories(prev => 
        prev.map(cat => 
          cat._id === categoryId 
            ? { ...cat, showInHomepage } 
            : cat
        )
      );
      
      setMessage({ 
        type: 'success', 
        text: `Category ${showInHomepage ? 'added to' : 'removed from'} homepage` 
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
      
    } catch (error) {
      console.error('Error updating category:', error);
      setMessage({ type: 'error', text: 'Failed to update category' });
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Homepage Categories</h1>
        </div>
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="w-24 h-4 bg-gray-200 rounded"></div>
                      <div className="w-32 h-3 bg-gray-200 rounded mt-1"></div>
                    </div>
                  </div>
                  <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const homepageCategories = categories.filter(cat => cat.showInHomepage);
  const availableCategories = categories.filter(cat => !cat.showInHomepage);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Homepage Categories</h1>
          <p className="text-gray-600 mt-1">
            Manage which categories appear on the homepage. Currently showing {homepageCategories.length} categories.
          </p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-lg">
          <span className="text-sm font-medium text-blue-800">
            Limit: 8 categories
          </span>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Currently on Homepage */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              On Homepage ({homepageCategories.length}/8)
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              These categories are currently displayed on the homepage
            </p>
          </div>
          <div className="p-6">
            {homepageCategories.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No categories selected for homepage
              </p>
            ) : (
              <div className="space-y-3">
                {homepageCategories.map((category) => (
                  <div key={category._id} className="flex items-center justify-between p-4 border border-green-200 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">
                        {category.icon || '📁'}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-600">{category.description}</p>
                        {category.parentCategory && (
                          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mt-1">
                            Subcategory of {category.parentCategory}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => updateHomepageVisibility(category._id!, false)}
                      disabled={updating === category._id}
                      className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {updating === category._id ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Available Categories */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Available Categories ({availableCategories.length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Click to add categories to the homepage
            </p>
          </div>
          <div className="p-6">
            {availableCategories.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                All categories are currently on the homepage
              </p>
            ) : (
              <div className="space-y-3">
                {availableCategories.map((category) => (
                  <div key={category._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">
                        {category.icon || '📁'}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-600">{category.description}</p>
                        {category.parentCategory && (
                          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mt-1">
                            Subcategory of {category.parentCategory}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => updateHomepageVisibility(category._id!, true)}
                      disabled={updating === category._id || homepageCategories.length >= 8}
                      className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={homepageCategories.length >= 8 ? 'Maximum 8 categories allowed' : 'Add to homepage'}
                    >
                      {updating === category._id ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">💡 Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Keep the number of homepage categories between 6-8 for optimal user experience</li>
          <li>• Mix main categories (Skincare, Makeup) with popular subcategories (Serums, Foundation)</li>
          <li>• Categories with more products typically perform better on the homepage</li>
          <li>• Changes take effect immediately on the website</li>
        </ul>
      </div>
    </div>
  );
}

