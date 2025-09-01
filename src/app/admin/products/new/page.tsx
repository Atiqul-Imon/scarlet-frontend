'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
  PlusIcon,
  EyeIcon,
  TrashIcon,
  DocumentTextIcon,
  TagIcon,
  CubeIcon,
  ChartBarIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/lib/context';
import { useForm } from '@/lib/hooks';
import type { AdminProduct } from '@/lib/admin-types';

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  comparePrice: number;
  cost: number;
  sku: string;
  barcode: string;
  category: string;
  subcategory: string;
  brand: string;
  tags: string[];
  images: string[];
  variants: Array<{
    id?: string;
    name: string;
    sku: string;
    stock: number;
    price: number;
  }>;
  stock: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  status: 'active' | 'draft' | 'archived';
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
}

const CATEGORIES = [
  { value: 'Makeup', label: 'Makeup', subcategories: ['Lipstick', 'Foundation', 'Eyeshadow', 'Mascara', 'Blush'] },
  { value: 'Skincare', label: 'Skincare', subcategories: ['Cleansers', 'Moisturizers', 'Serums', 'Masks', 'Toners'] },
  { value: 'Bath & Body', label: 'Bath & Body', subcategories: ['Body Wash', 'Body Lotion', 'Body Butter', 'Scrubs'] },
  { value: 'Fragrance', label: 'Fragrance', subcategories: ['Perfume', 'Body Spray', 'Essential Oils'] },
];

const BRANDS = [
  'Scarlet Beauty',
  'Scarlet Natural',
  'Scarlet Luxury',
  'Other'
];

export default function NewProductPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [tagInput, setTagInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');

  const { values, errors, handleChange, handleSubmit, setFieldValue } = useForm<ProductFormData>({
    initialValues: {
      name: '',
      slug: '',
      description: '',
      shortDescription: '',
      price: 0,
      comparePrice: 0,
      cost: 0,
      sku: '',
      barcode: '',
      category: '',
      subcategory: '',
      brand: '',
      tags: [],
      images: [],
      variants: [],
      stock: 0,
      lowStockThreshold: 10,
      trackInventory: true,
      status: 'draft',
      weight: 0,
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
      },
      seoTitle: '',
      seoDescription: '',
      seoKeywords: [],
    },
    validate: (values) => {
      const errors: Partial<ProductFormData> = {};
      
      if (!values.name) errors.name = 'Product name is required';
      if (!values.slug) errors.slug = 'Product slug is required';
      if (!values.price || values.price <= 0) errors.price = 'Price must be greater than 0';
      if (!values.sku) errors.sku = 'SKU is required';
      if (!values.category) errors.category = 'Category is required';
      if (!values.brand) errors.brand = 'Brand is required';
      
      return errors;
    },
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        // await adminApi.products.create(values);
        console.log('Creating product:', values);
        
        addToast({
          type: 'success',
          title: 'Product created',
          message: 'The product has been created successfully.',
        });
        
        router.push('/admin/products');
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Creation failed',
          message: 'Failed to create product. Please try again.',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Auto-generate slug from name
  React.useEffect(() => {
    if (values.name && !values.slug) {
      const slug = values.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFieldValue('slug', slug);
    }
  }, [values.name, values.slug, setFieldValue]);

  // Auto-generate SEO title from name
  React.useEffect(() => {
    if (values.name && !values.seoTitle) {
      setFieldValue('seoTitle', values.name);
    }
  }, [values.name, values.seoTitle, setFieldValue]);

  const handleImageUpload = useCallback((files: FileList | null) => {
    if (!files) return;
    
    // In a real app, you would upload to your image service
    const newImages = Array.from(files).map((file, index) => 
      `/api/placeholder/400/400?${Date.now()}-${index}`
    );
    
    setFieldValue('images', [...values.images, ...newImages]);
  }, [values.images, setFieldValue]);

  const removeImage = useCallback((index: number) => {
    const newImages = values.images.filter((_, i) => i !== index);
    setFieldValue('images', newImages);
  }, [values.images, setFieldValue]);

  const addTag = useCallback(() => {
    if (tagInput.trim() && !values.tags.includes(tagInput.trim())) {
      setFieldValue('tags', [...values.tags, tagInput.trim()]);
      setTagInput('');
    }
  }, [tagInput, values.tags, setFieldValue]);

  const removeTag = useCallback((index: number) => {
    const newTags = values.tags.filter((_, i) => i !== index);
    setFieldValue('tags', newTags);
  }, [values.tags, setFieldValue]);

  const addKeyword = useCallback(() => {
    if (keywordInput.trim() && !values.seoKeywords.includes(keywordInput.trim())) {
      setFieldValue('seoKeywords', [...values.seoKeywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  }, [keywordInput, values.seoKeywords, setFieldValue]);

  const removeKeyword = useCallback((index: number) => {
    const newKeywords = values.seoKeywords.filter((_, i) => i !== index);
    setFieldValue('seoKeywords', newKeywords);
  }, [values.seoKeywords, setFieldValue]);

  const addVariant = useCallback(() => {
    const newVariant = {
      name: '',
      sku: `${values.sku}-VAR-${values.variants.length + 1}`,
      stock: 0,
      price: values.price,
    };
    setFieldValue('variants', [...values.variants, newVariant]);
  }, [values.variants, values.sku, values.price, setFieldValue]);

  const removeVariant = useCallback((index: number) => {
    const newVariants = values.variants.filter((_, i) => i !== index);
    setFieldValue('variants', newVariants);
  }, [values.variants, setFieldValue]);

  const updateVariant = useCallback((index: number, field: string, value: any) => {
    const newVariants = [...values.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFieldValue('variants', newVariants);
  }, [values.variants, setFieldValue]);

  const selectedCategory = CATEGORIES.find(cat => cat.value === values.category);

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: DocumentTextIcon },
    { id: 'images', label: 'Images', icon: PhotoIcon },
    { id: 'pricing', label: 'Pricing', icon: ChartBarIcon },
    { id: 'inventory', label: 'Inventory', icon: CubeIcon },
    { id: 'variants', label: 'Variants', icon: TagIcon },
    { id: 'seo', label: 'SEO', icon: GlobeAltIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/products"
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-white transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
                <p className="text-gray-600 mt-1">
                  Create a new product for your catalog
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => router.push('/admin/products')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <Button
                onClick={handleSubmit}
                loading={isSubmitting}
                variant="primary"
                className="px-6"
              >
                Create Product
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-6">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">Product Details</h3>
              </div>
              <nav className="p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-pink-50 text-pink-700 border border-pink-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <form onSubmit={handleSubmit}>
                {/* Basic Info Tab */}
                {activeTab === 'basic' && (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <Input
                          label="Product Name"
                          name="name"
                          value={values.name}
                          onChange={handleChange}
                          error={errors.name}
                          placeholder="Enter product name"
                          required
                        />
                      </div>

                      <Input
                        label="Product Slug"
                        name="slug"
                        value={values.slug}
                        onChange={handleChange}
                        error={errors.slug}
                        placeholder="product-slug"
                        helperText="URL-friendly version of the name"
                        required
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          name="status"
                          value={values.status}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 bg-white"
                        >
                          <option value="draft">Draft</option>
                          <option value="active">Active</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          name="category"
                          value={values.category}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 bg-white"
                          required
                        >
                          <option value="">Select Category</option>
                          {CATEGORIES.map(category => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                        {errors.category && (
                          <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subcategory
                        </label>
                        <select
                          name="subcategory"
                          value={values.subcategory}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 bg-white"
                          disabled={!selectedCategory}
                        >
                          <option value="">Select Subcategory</option>
                          {selectedCategory?.subcategories.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Brand
                        </label>
                        <select
                          name="brand"
                          value={values.brand}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 bg-white"
                          required
                        >
                          <option value="">Select Brand</option>
                          {BRANDS.map(brand => (
                            <option key={brand} value={brand}>{brand}</option>
                          ))}
                        </select>
                        {errors.brand && (
                          <p className="mt-1 text-sm text-red-600">{errors.brand}</p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Short Description
                        </label>
                        <textarea
                          name="shortDescription"
                          value={values.shortDescription}
                          onChange={handleChange}
                          rows={2}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 bg-white"
                          placeholder="Brief product description for listings"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Description
                        </label>
                        <textarea
                          name="description"
                          value={values.description}
                          onChange={handleChange}
                          rows={6}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 bg-white"
                          placeholder="Detailed product description with features and benefits"
                        />
                      </div>

                      {/* Tags */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tags
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {values.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pink-100 text-pink-800"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(index)}
                                className="ml-2 text-pink-600 hover:text-pink-800"
                              >
                                <XMarkIcon className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 bg-white"
                            placeholder="Add a tag"
                          />
                          <button
                            type="button"
                            onClick={addTag}
                            className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Images Tab */}
                {activeTab === 'images' && (
                  <div className="p-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Product Images</h3>
                      <p className="text-gray-600 text-sm">
                        Upload high-quality images of your product. The first image will be used as the main product image.
                      </p>
                    </div>

                    {/* Image Upload Area */}
                    <div className="mb-6">
                      <label className="block">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-pink-400 transition-colors cursor-pointer">
                          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-4">
                            <p className="text-lg font-medium text-gray-900">
                              Drop images here or click to upload
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              PNG, JPG, GIF up to 10MB each
                            </p>
                          </div>
                        </div>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e.target.files)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Image Gallery */}
                    {values.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {values.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Product image ${index + 1}`}
                              className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                              <button
                                type="button"
                                onClick={() => {/* Preview functionality */}}
                                className="p-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                            {index === 0 && (
                              <div className="absolute top-2 left-2">
                                <span className="px-2 py-1 text-xs font-medium bg-pink-500 text-white rounded">
                                  Main
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Pricing Tab */}
                {activeTab === 'pricing' && (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Input
                        label="Selling Price (৳)"
                        name="price"
                        type="number"
                        value={values.price}
                        onChange={handleChange}
                        error={errors.price}
                        placeholder="0"
                        required
                      />

                      <Input
                        label="Compare at Price (৳)"
                        name="comparePrice"
                        type="number"
                        value={values.comparePrice}
                        onChange={handleChange}
                        placeholder="0"
                        helperText="Original price for discount display"
                      />

                      <Input
                        label="Cost per Item (৳)"
                        name="cost"
                        type="number"
                        value={values.cost}
                        onChange={handleChange}
                        placeholder="0"
                        helperText="Cost for profit calculation"
                      />

                      <Input
                        label="SKU"
                        name="sku"
                        value={values.sku}
                        onChange={handleChange}
                        error={errors.sku}
                        placeholder="PROD-001"
                        helperText="Stock Keeping Unit"
                        required
                      />

                      <Input
                        label="Barcode"
                        name="barcode"
                        value={values.barcode}
                        onChange={handleChange}
                        placeholder="1234567890123"
                        helperText="Product barcode (optional)"
                      />
                    </div>

                    {/* Profit Calculation */}
                    {values.price > 0 && values.cost > 0 && (
                      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Profit Analysis</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-green-700">Profit per Item</p>
                            <p className="font-bold text-green-900">
                              ৳{(values.price - values.cost).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-green-700">Profit Margin</p>
                            <p className="font-bold text-green-900">
                              {(((values.price - values.cost) / values.price) * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-green-700">Markup</p>
                            <p className="font-bold text-green-900">
                              {(((values.price - values.cost) / values.cost) * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Inventory Tab */}
                {activeTab === 'inventory' && (
                  <div className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="trackInventory"
                          name="trackInventory"
                          checked={values.trackInventory}
                          onChange={handleChange}
                          className="w-4 h-4 text-pink-600 bg-white border-gray-300 rounded focus:ring-pink-500"
                        />
                        <label htmlFor="trackInventory" className="text-sm font-medium text-gray-700">
                          Track inventory for this product
                        </label>
                      </div>

                      {values.trackInventory && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Input
                            label="Stock Quantity"
                            name="stock"
                            type="number"
                            value={values.stock}
                            onChange={handleChange}
                            placeholder="0"
                          />

                          <Input
                            label="Low Stock Threshold"
                            name="lowStockThreshold"
                            type="number"
                            value={values.lowStockThreshold}
                            onChange={handleChange}
                            placeholder="10"
                            helperText="Alert when stock falls below this number"
                          />
                        </div>
                      )}

                      {/* Shipping */}
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="font-medium text-gray-900 mb-4">Shipping Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <Input
                            label="Weight (kg)"
                            name="weight"
                            type="number"
                            step="0.01"
                            value={values.weight}
                            onChange={handleChange}
                            placeholder="0.00"
                          />

                          <Input
                            label="Length (cm)"
                            name="dimensions.length"
                            type="number"
                            value={values.dimensions.length}
                            onChange={handleChange}
                            placeholder="0"
                          />

                          <Input
                            label="Width (cm)"
                            name="dimensions.width"
                            type="number"
                            value={values.dimensions.width}
                            onChange={handleChange}
                            placeholder="0"
                          />

                          <Input
                            label="Height (cm)"
                            name="dimensions.height"
                            type="number"
                            value={values.dimensions.height}
                            onChange={handleChange}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Variants Tab */}
                {activeTab === 'variants' && (
                  <div className="p-6">
                    <div className="mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">Product Variants</h3>
                          <p className="text-gray-600 text-sm mt-1">
                            Add variants like size, color, or other options
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={addVariant}
                          className="inline-flex items-center px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors"
                        >
                          <PlusIcon className="w-4 h-4 mr-2" />
                          Add Variant
                        </button>
                      </div>
                    </div>

                    {values.variants.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <TagIcon className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">
                          No variants added yet. Click "Add Variant" to get started.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {values.variants.map((variant, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium text-gray-900">
                                Variant {index + 1}
                              </h4>
                              <button
                                type="button"
                                onClick={() => removeVariant(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <input
                                type="text"
                                placeholder="Variant name (e.g., Red, Large)"
                                value={variant.name}
                                onChange={(e) => updateVariant(index, 'name', e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 bg-white"
                              />
                              
                              <input
                                type="text"
                                placeholder="SKU"
                                value={variant.sku}
                                onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 bg-white"
                              />
                              
                              <input
                                type="number"
                                placeholder="Stock"
                                value={variant.stock}
                                onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 bg-white"
                              />
                              
                              <input
                                type="number"
                                placeholder="Price"
                                value={variant.price}
                                onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 bg-white"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* SEO Tab */}
                {activeTab === 'seo' && (
                  <div className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Search Engine Optimization
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Optimize your product for search engines and social media
                        </p>
                      </div>

                      <Input
                        label="SEO Title"
                        name="seoTitle"
                        value={values.seoTitle}
                        onChange={handleChange}
                        placeholder="Product name - Brand | Store"
                        helperText={`${values.seoTitle.length}/60 characters`}
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SEO Description
                        </label>
                        <textarea
                          name="seoDescription"
                          value={values.seoDescription}
                          onChange={handleChange}
                          rows={3}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 bg-white"
                          placeholder="Brief description for search results"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {values.seoDescription.length}/160 characters
                        </p>
                      </div>

                      {/* SEO Keywords */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SEO Keywords
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {values.seoKeywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                            >
                              {keyword}
                              <button
                                type="button"
                                onClick={() => removeKeyword(index)}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                              >
                                <XMarkIcon className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={keywordInput}
                            onChange={(e) => setKeywordInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 bg-white"
                            placeholder="Add SEO keyword"
                          />
                          <button
                            type="button"
                            onClick={addKeyword}
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* URL Preview */}
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <h4 className="font-medium text-gray-900 mb-2">Search Preview</h4>
                        <div className="space-y-1">
                          <div className="text-blue-600 text-sm">
                            https://scarlet.com/products/{values.slug || 'product-name'}
                          </div>
                          <div className="text-lg text-blue-600 hover:underline cursor-pointer">
                            {values.seoTitle || values.name || 'Product Title'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {values.seoDescription || values.shortDescription || 'Product description will appear here...'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
