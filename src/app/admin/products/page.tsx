'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  PlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useToast } from '@/lib/context';
import { adminApi } from '@/lib/admin-api';
import type { ExtendedAdminProduct } from '@/lib/admin-types';

interface ProductFilters {
  search: string;
  category: string;
  status: string;
  stockStatus: string;
  priceRange: [number, number];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const STOCK_STATUS_OPTIONS = [
  { value: '', label: 'All Stock Status' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'pre_order', label: 'Pre-order' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
];

const SORT_OPTIONS = [
  { value: 'name', label: 'Product Name' },
  { value: 'price', label: 'Price' },
  { value: 'stock', label: 'Stock Quantity' },
  { value: 'createdAt', label: 'Date Created' },
  { value: 'updatedAt', label: 'Last Updated' },
  { value: 'sales', label: 'Sales Count' },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<ExtendedAdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    category: '',
    status: '',
    stockStatus: '',
    priceRange: [0, 10000],
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  const { addToast } = useToast();

  // Mock data for development
  React.useEffect(() => {
    const mockProducts: ExtendedAdminProduct[] = [
      {
        id: '1',
        name: 'Luxury Rose Gold Lipstick',
        slug: 'luxury-rose-gold-lipstick',
        description: 'Premium matte lipstick with long-lasting formula',
        shortDescription: 'Premium matte lipstick',
        price: 2500,
        comparePrice: 3000,
        cost: 1200,
        sku: 'LIP-RG-001',
        barcode: '1234567890123',
        category: 'Makeup',
        subcategory: 'Lipstick',
        brand: 'Scarlet Beauty',
        tags: ['lipstick', 'matte', 'luxury', 'rose gold'],
        images: ['/api/placeholder/300/300', '/api/placeholder/300/300'],
        variants: [
          { id: '1a', name: 'Crimson Rose', sku: 'LIP-RG-001-CR', stock: 45, price: 2500 },
          { id: '1b', name: 'Nude Pink', sku: 'LIP-RG-001-NP', stock: 23, price: 2500 },
        ],
        stock: 68,
        lowStockThreshold: 10,
        trackInventory: true,
        status: 'active',
        stockStatus: 'in_stock',
        weight: 0.05,
        dimensions: { length: 10, width: 2, height: 2 },
        seoTitle: 'Luxury Rose Gold Lipstick - Premium Matte Formula',
        seoDescription: 'Discover our premium matte lipstick collection with long-lasting formula',
        seoKeywords: ['lipstick', 'matte', 'luxury', 'cosmetics'],
        createdAt: '2025-01-15T10:00:00Z',
        updatedAt: '2025-01-18T14:30:00Z',
        salesCount: 156,
        viewCount: 2340,
        rating: 4.8,
        reviewCount: 23,
      },
      {
        id: '2',
        name: 'Hydrating Face Serum',
        slug: 'hydrating-face-serum',
        description: 'Advanced hyaluronic acid serum for deep hydration',
        shortDescription: 'Hyaluronic acid serum',
        price: 3500,
        comparePrice: 4200,
        cost: 1800,
        sku: 'SER-HYD-002',
        barcode: '1234567890124',
        category: 'Skincare',
        subcategory: 'Serums',
        brand: 'Scarlet Beauty',
        tags: ['serum', 'hydrating', 'hyaluronic acid', 'skincare'],
        images: ['/api/placeholder/300/300'],
        variants: [],
        stock: 5,
        lowStockThreshold: 10,
        trackInventory: true,
        status: 'active',
        stockStatus: 'low_stock',
        weight: 0.12,
        dimensions: { length: 12, width: 4, height: 4 },
        seoTitle: 'Hydrating Face Serum - Hyaluronic Acid Formula',
        seoDescription: 'Premium hydrating serum with hyaluronic acid for glowing skin',
        seoKeywords: ['serum', 'hydrating', 'skincare', 'hyaluronic acid'],
        createdAt: '2025-01-10T09:00:00Z',
        updatedAt: '2025-01-17T11:15:00Z',
        salesCount: 89,
        viewCount: 1876,
        rating: 4.9,
        reviewCount: 12,
      },
      {
        id: '3',
        name: 'Organic Body Butter',
        slug: 'organic-body-butter',
        description: 'Rich, nourishing body butter made with organic ingredients',
        shortDescription: 'Organic nourishing body butter',
        price: 1800,
        comparePrice: 2200,
        cost: 900,
        sku: 'BB-ORG-003',
        barcode: '1234567890125',
        category: 'Bath & Body',
        subcategory: 'Body Care',
        brand: 'Scarlet Natural',
        tags: ['body butter', 'organic', 'moisturizer', 'natural'],
        images: ['/api/placeholder/300/300', '/api/placeholder/300/300'],
        variants: [
          { id: '3a', name: 'Vanilla', sku: 'BB-ORG-003-VAN', stock: 0, price: 1800 },
          { id: '3b', name: 'Lavender', sku: 'BB-ORG-003-LAV', stock: 12, price: 1800 },
        ],
        stock: 12,
        lowStockThreshold: 15,
        trackInventory: true,
        status: 'active',
        stockStatus: 'out_of_stock',
        weight: 0.25,
        dimensions: { length: 8, width: 8, height: 6 },
        seoTitle: 'Organic Body Butter - Natural Moisturizing Cream',
        seoDescription: 'Luxurious organic body butter for soft, hydrated skin',
        seoKeywords: ['body butter', 'organic', 'natural', 'moisturizer'],
        createdAt: '2025-01-05T08:30:00Z',
        updatedAt: '2025-01-16T16:45:00Z',
        salesCount: 234,
        viewCount: 3210,
        rating: 4.7,
        reviewCount: 45,
      },
    ];

    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSelectProduct = useCallback((productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  }, [selectedProducts.length, products]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedProducts.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} product(s)?`)) {
      try {
        // await adminApi.products.bulkDelete(selectedProducts);
        setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
        setSelectedProducts([]);
        addToast({
          type: 'success',
          title: 'Products deleted',
          message: `${selectedProducts.length} product(s) have been deleted successfully.`,
        });
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Delete failed',
          message: 'Failed to delete products. Please try again.',
        });
      }
    }
  }, [selectedProducts, addToast]);

  const handleBulkStatusUpdate = useCallback(async (status: string) => {
    if (selectedProducts.length === 0) return;
    
    try {
      // await adminApi.products.bulkUpdateStatus(selectedProducts, status);
      setProducts(prev => prev.map(p => 
        selectedProducts.includes(p.id) ? { ...p, status: status as any } : p
      ));
      setSelectedProducts([]);
      addToast({
        type: 'success',
        title: 'Status updated',
        message: `${selectedProducts.length} product(s) status updated to ${status}.`,
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Update failed',
        message: 'Failed to update product status. Please try again.',
      });
    }
  }, [selectedProducts, addToast]);

  const getStockStatusBadge = (product: ExtendedAdminProduct) => {
    const { stockStatus, stock, lowStockThreshold } = product;
    
    if (stockStatus === 'out_of_stock' || stock === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
          Out of Stock
        </span>
      );
    }
    
    if (stockStatus === 'low_stock' || stock <= lowStockThreshold) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
          Low Stock
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        In Stock
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
      archived: { bg: 'bg-red-100', text: 'text-red-800', label: 'Archived' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Products</h1>
            <p className="text-gray-600">
              Manage your product catalog, inventory, and pricing
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={() => {/* Export functionality */}}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              onClick={() => {/* Import functionality */}}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
              Import
            </button>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Product
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Squares2X2Icon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-amber-600">
                  {products.filter(p => p.stockStatus === 'low_stock' || p.stock <= p.lowStockThreshold).length}
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">
                  {products.filter(p => p.stockStatus === 'out_of_stock' || p.stock === 0).length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-green-600">
                  {products.filter(p => p.status === 'active').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <EyeIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  showFilters 
                    ? 'border-pink-500 text-pink-700 bg-pink-50' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                <FunnelIcon className="w-4 h-4 mr-2" />
                Filters
              </button>

              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-pink-50 text-pink-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Squares2X2Icon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 border-l border-gray-300 ${viewMode === 'list' ? 'bg-pink-50 text-pink-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <ListBulletIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="Makeup">Makeup</option>
                  <option value="Skincare">Skincare</option>
                  <option value="Bath & Body">Bath & Body</option>
                  <option value="Fragrance">Fragrance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  {STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Status
                </label>
                <select
                  value={filters.stockStatus}
                  onChange={(e) => setFilters(prev => ({ ...prev, stockStatus: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  {STOCK_STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <div className="flex space-x-2">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    {SORT_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
                    }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                  >
                    {filters.sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="p-4 bg-blue-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <p className="text-sm font-medium text-blue-900">
                  {selectedProducts.length} product(s) selected
                </p>
                <button
                  onClick={() => setSelectedProducts([])}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkStatusUpdate('active')}
                  className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('draft')}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
                >
                  Draft
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Products Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Product Image */}
              <div className="relative aspect-square bg-gray-100">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => handleSelectProduct(product.id)}
                  className="absolute top-3 left-3 w-4 h-4 text-pink-600 bg-white border-gray-300 rounded focus:ring-pink-500 z-10"
                />
                <img
                  src={product.images[0] || '/api/placeholder/300/300'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  {getStockStatusBadge(product)}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 line-clamp-2 flex-1">
                    {product.name}
                  </h3>
                  <div className="ml-2">
                    {getStatusBadge(product.status)}
                  </div>
                </div>

                <p className="text-sm text-gray-500 mb-2">
                  SKU: {product.sku}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      ৳{product.price.toLocaleString()}
                    </p>
                    {product.comparePrice && product.comparePrice > product.price && (
                      <p className="text-sm text-gray-500 line-through">
                        ৳{product.comparePrice.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      Stock: {product.stock}
                    </p>
                    <p className="text-xs text-gray-500">
                      Sales: {product.salesCount}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="p-2 text-gray-400 hover:text-pink-600 rounded-lg hover:bg-pink-50 transition-colors"
                      title="View"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Edit"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => {/* Duplicate functionality */}}
                      className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                      title="Duplicate"
                    >
                      <DocumentDuplicateIcon className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500">
                    ⭐ {product.rating} ({product.reviewCount})
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List View
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === products.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-pink-600 bg-white border-gray-300 rounded focus:ring-pink-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="w-4 h-4 text-pink-600 bg-white border-gray-300 rounded focus:ring-pink-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={product.images[0] || '/api/placeholder/60/60'}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover mr-4"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        ৳{product.price.toLocaleString()}
                      </div>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <div className="text-sm text-gray-500 line-through">
                          ৳{product.comparePrice.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {product.stock}
                        </span>
                        {getStockStatusBadge(product)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(product.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {product.salesCount}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="text-pink-600 hover:text-pink-900"
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <Squares2X2Icon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first product.
          </p>
          <div className="mt-6">
            <Link
              href="/admin/products/new"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Product
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
