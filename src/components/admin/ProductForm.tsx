'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/lib/context';
import { adminApi, categoryApi } from '@/lib/api';
import { uploadImage, validateImageFile } from '@/lib/image-upload';
import { getImageKitStatus } from '@/lib/imagekit-test';
import { Category } from '@/lib/types';

interface ProductFormProps {
  productId?: string;
  initialData?: any;
  mode: 'create' | 'edit';
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: string;
  comparePrice: string;
  cost: string;
  sku: string;
  barcode: string;
  category: string;
  subcategory: string;
  brand: string;
  tags: string[];
  stock: string;
  lowStockThreshold: string;
  trackInventory: boolean;
  status: string;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  homepageSection: string;
  variants: Array<{
    id: string;
    name: string;
    sku: string;
    stock: string;
    price: string;
  }>;
}

const ProductForm: React.FC<ProductFormProps> = ({ productId, initialData, mode }) => {
  const router = useRouter();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    price: '',
    comparePrice: '',
    cost: '',
    sku: '',
    barcode: '',
    category: '',
    subcategory: '',
    brand: '',
    tags: [],
    stock: '',
    lowStockThreshold: '10',
    trackInventory: true,
    status: 'draft',
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: ''
    },
    seoTitle: '',
    seoDescription: '',
    seoKeywords: [],
    homepageSection: '',
    variants: []
  });

  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(mode === 'edit');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Load categories
  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const categoriesData = await categoryApi.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      addToast({
        type: 'error',
        title: 'Failed to load categories',
        message: 'Unable to fetch categories from the database. Please try again.'
      });
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Load product data for edit mode
  useEffect(() => {
    if (mode === 'edit' && productId) {
      loadProductData();
    } else if (initialData) {
      setFormData(initialData);
      setImages(initialData.images || []);
    }
  }, [mode, productId, initialData]);

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadProductData = async () => {
    try {
      const product = await adminApi.products.getProduct(productId!);
      
      // Transform backend data to frontend format
      const transformedData: ProductFormData = {
        name: product.title || '',
        slug: product.slug || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        price: product.price?.amount?.toString() || '',
        comparePrice: product.price?.originalAmount?.toString() || '',
        cost: product.attributes?.cost?.toString() || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        category: product.attributes?.category || '',
        subcategory: product.attributes?.subcategory || '',
        brand: product.brand || '',
        tags: product.tags || [],
        stock: product.stock?.toString() || '',
        lowStockThreshold: product.lowStockThreshold?.toString() || '10',
        trackInventory: product.trackInventory !== false,
        status: product.status || 'draft',
        weight: product.weight?.toString() || '',
        dimensions: {
          length: product.dimensions?.length?.toString() || '',
          width: product.dimensions?.width?.toString() || '',
          height: product.dimensions?.height?.toString() || ''
        },
        seoTitle: product.seoTitle || '',
        seoDescription: product.seoDescription || '',
        seoKeywords: product.seoKeywords || [],
        variants: product.variants || []
      };

      setFormData(transformedData);
      setImages(product.images || []);
    } catch (error) {
      console.error('Failed to load product:', error);
      addToast({
        type: 'error',
        title: 'Failed to load product',
        message: 'Could not load product data. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent as string]: {
          ...(prev[parent as keyof ProductFormData] as any),
          [child as string]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Utility function to generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  // Utility function to generate SKU from title and brand
  const generateSKU = (title: string, brand: string = ''): string => {
    const titleWords = title
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .split(' ')
      .filter(word => word.length > 0)
      .slice(0, 3); // Take first 3 words
    
    const brandPrefix = brand
      .toLowerCase()
      .replace(/[^\w]/g, '') // Remove special characters
      .slice(0, 3); // Take first 3 characters
    
    const titlePrefix = titleWords
      .map(word => word.slice(0, 2)) // Take first 2 characters of each word
      .join('')
      .toUpperCase();
    
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    if (brandPrefix) {
      return `${brandPrefix.toUpperCase()}-${titlePrefix}-${randomSuffix}`;
    }
    
    return `${titlePrefix}-${randomSuffix}`;
  };

  // Handle title change and auto-generate slug
  const handleTitleChange = (value: string) => {
    setFormData(prev => {
      const newSlug = generateSlug(value);
      return {
        ...prev,
        name: value,
        // Auto-generate slug if it's empty or if the current slug was auto-generated from the previous title
        slug: prev.slug === '' || prev.slug === generateSlug(prev.name) ? newSlug : prev.slug,
        // Also auto-generate SKU if it's empty or was auto-generated
        sku: prev.sku === '' || prev.sku === generateSKU(prev.name, prev.brand) ? generateSKU(value, prev.brand) : prev.sku
      };
    });
  };

  // Handle brand change and auto-generate SKU
  const handleBrandChange = (value: string) => {
    setFormData(prev => {
      const newSKU = generateSKU(prev.name, value);
      return {
        ...prev,
        brand: value,
        // Auto-generate SKU if it's empty or if the current SKU was auto-generated from the previous brand
        sku: prev.sku === '' || prev.sku === generateSKU(prev.name, prev.brand) ? newSKU : prev.sku
      };
    });
  };

  const handleImageUpload = useCallback(async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      addToast({
        type: 'error',
        title: 'Invalid image',
        message: validation.error || 'Please select a valid image file (JPG, PNG, WebP) under 5MB.'
      });
      return;
    }

    if (!getImageKitStatus().configured) {
      addToast({
        type: 'error',
        title: 'ImageKit Not Configured',
        message: 'ImageKit is not properly configured. Please check your environment variables.'
      });
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadImage(file, formData.slug || 'temp');
      if (result.success && result.url) {
        setImages(prev => [...prev, result.url!]);
        addToast({
          type: 'success',
          title: 'Image uploaded',
          message: 'Image uploaded successfully!'
        });
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      addToast({
        type: 'error',
        title: 'Upload failed',
        message: 'Failed to upload image. Please try again.'
      });
    } finally {
      setIsUploading(false);
    }
  }, [formData.slug, addToast]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0]) {
      handleImageUpload(files[0]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    const newVariant = {
      id: Date.now().toString(),
      name: '',
      sku: '',
      stock: '',
      price: formData.price
    };
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant]
    }));
  };

  const updateVariant = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }));
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const productData = {
        ...formData,
        images,
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        stock: parseInt(formData.stock) || 0,
        lowStockThreshold: parseInt(formData.lowStockThreshold) || 10,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        dimensions: {
          length: formData.dimensions.length ? parseFloat(formData.dimensions.length) : 0,
          width: formData.dimensions.width ? parseFloat(formData.dimensions.width) : 0,
          height: formData.dimensions.height ? parseFloat(formData.dimensions.height) : 0
        },
        variants: formData.variants.map(variant => ({
          ...variant,
          stock: parseInt(variant.stock) || 0,
          price: parseFloat(variant.price) || 0
        })),
        homepageSection: formData.homepageSection || null
      };

      if (mode === 'create') {
        await adminApi.products.createProduct(productData);
        addToast({
          type: 'success',
          title: 'Product created',
          message: 'Product has been created successfully!'
        });
        router.push('/admin/products');
      } else {
        await adminApi.products.updateProduct(productId!, productData);
        addToast({
          type: 'success',
          title: 'Product updated',
          message: 'Product has been updated successfully!'
        });
        router.push(`/admin/products/${productId}`);
      }
    } catch (error: unknown) {
      console.error('Product operation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      addToast({
        type: 'error',
        title: mode === 'create' ? 'Creation failed' : 'Update failed',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="product-slug"
              />
              <button
                type="button"
                onClick={() => handleInputChange('slug', generateSlug(formData.name))}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                title="Generate slug from title"
              >
                Generate
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Auto-generated from title. You can customize it.
              <br />
              <span className="text-gray-400">Pattern: lowercase, hyphens for spaces, no special characters</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (৳) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compare Price (৳)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.comparePrice}
              onChange={(e) => handleInputChange('comparePrice', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SKU *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="BRAND-TITLE-XXXX"
              />
              <button
                type="button"
                onClick={() => handleInputChange('sku', generateSKU(formData.name, formData.brand))}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                title="Generate SKU from title and brand"
              >
                Generate
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Auto-generated from title and brand. You can customize it.
              <br />
              <span className="text-gray-400">Pattern: BRAND-TITLE-XXXX (e.g., CER-SERUM-A1B2)</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              disabled={categoriesLoading}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {categoriesLoading ? 'Loading categories...' : 'Select Category'}
              </option>
              {categories.map((category) => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            {categoriesLoading && (
              <p className="text-xs text-gray-500 mt-1">Loading categories from database...</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => handleBrandChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Short Description
          </label>
          <textarea
            rows={2}
            value={formData.shortDescription}
            onChange={(e) => handleInputChange('shortDescription', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Description
          </label>
          <textarea
            rows={6}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Product Images</h2>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleImageUpload(file);
              }
            }}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-700 hover:bg-red-800"
          >
            {isUploading ? 'Uploading...' : 'Upload Image'}
          </label>
          <p className="mt-2 text-sm text-gray-500">
            Drag and drop images here, or click to select
          </p>
        </div>

        {images.length > 0 && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`Product ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inventory */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Inventory</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Quantity
            </label>
            <input
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => handleInputChange('stock', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Low Stock Threshold
            </label>
            <input
              type="number"
              min="0"
              value={formData.lowStockThreshold}
              onChange={(e) => handleInputChange('lowStockThreshold', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="trackInventory"
              checked={formData.trackInventory}
              onChange={(e) => handleInputChange('trackInventory', e.target.checked)}
              className="h-4 w-4 text-red-700 focus:ring-red-500 border-gray-300 rounded bg-white"
            />
            <label htmlFor="trackInventory" className="ml-2 block text-sm text-gray-900">
              Track Inventory
            </label>
          </div>
        </div>
      </div>

      {/* Variants */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">Product Variants</h2>
          <Button
            type="button"
            variant="secondary"
            onClick={addVariant}
          >
            Add Variant
          </Button>
        </div>

        {formData.variants.map((variant, index) => (
          <div key={variant.id} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Variant {index + 1}</h3>
              <button
                type="button"
                onClick={() => removeVariant(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={variant.name}
                  onChange={(e) => updateVariant(index, 'name', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  value={variant.sku}
                  onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={variant.stock}
                  onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={variant.price}
                  onChange={(e) => updateVariant(index, 'price', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Homepage Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Homepage Display</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Homepage Section
          </label>
          <select
            value={formData.homepageSection}
            onChange={(e) => handleInputChange('homepageSection', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">No section (default)</option>
            <option value="new-arrivals">New Arrivals</option>
            <option value="skincare-essentials">Skincare Essentials</option>
            <option value="makeup-collection">Makeup Collection</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Select which homepage section this product should appear in. Leave empty to not show on homepage.
          </p>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center justify-end space-x-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Update Product'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
