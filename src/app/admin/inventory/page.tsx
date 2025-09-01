'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  PlusIcon,
  MinusIcon,
  EyeIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '@/lib/context';
import { adminApi } from '@/lib/api';
import type { AdminProduct } from '@/lib/admin-types';

interface InventoryItem extends AdminProduct {
  reorderPoint: number;
  maxStock: number;
  reservedStock: number;
  availableStock: number;
  lastRestockDate: string;
  supplier: string;
  location: string;
  turnoverRate: number;
}

interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  date: string;
  user: string;
  reference?: string;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showMovements, setShowMovements] = useState(false);
  const [adjustmentModal, setAdjustmentModal] = useState<{
    isOpen: boolean;
    product?: InventoryItem;
  }>({ isOpen: false });

  const { addToast } = useToast();

  useEffect(() => {
    // Mock data for development
    const mockInventory: InventoryItem[] = [
      {
        id: '1',
        name: 'Luxury Rose Gold Lipstick',
        slug: 'luxury-rose-gold-lipstick',
        description: 'Premium matte lipstick',
        shortDescription: 'Premium matte lipstick',
        price: 2500,
        comparePrice: 3000,
        cost: 1200,
        sku: 'LIP-RG-001',
        barcode: '1234567890123',
        category: 'Makeup',
        subcategory: 'Lipstick',
        brand: 'Scarlet Beauty',
        tags: ['lipstick', 'matte'],
        images: ['/api/placeholder/100/100'],
        variants: [],
        stock: 15,
        lowStockThreshold: 20,
        trackInventory: true,
        status: 'active',
        stockStatus: 'low_stock',
        weight: 0.05,
        dimensions: { length: 10, width: 2, height: 2 },
        seoTitle: 'Luxury Rose Gold Lipstick',
        seoDescription: 'Premium matte lipstick',
        seoKeywords: ['lipstick'],
        createdAt: '2025-01-15T10:00:00Z',
        updatedAt: '2025-01-18T14:30:00Z',
        salesCount: 156,
        viewCount: 2340,
        rating: 4.8,
        reviewCount: 23,
        // Inventory specific fields
        reorderPoint: 20,
        maxStock: 100,
        reservedStock: 5,
        availableStock: 10,
        lastRestockDate: '2025-01-10T00:00:00Z',
        supplier: 'Beauty Suppliers Ltd',
        location: 'Warehouse A-1',
        turnoverRate: 8.5,
      },
      {
        id: '2',
        name: 'Hydrating Face Serum',
        slug: 'hydrating-face-serum',
        description: 'Advanced hyaluronic acid serum',
        shortDescription: 'Hyaluronic acid serum',
        price: 3500,
        comparePrice: 4200,
        cost: 1800,
        sku: 'SER-HYD-002',
        barcode: '1234567890124',
        category: 'Skincare',
        subcategory: 'Serums',
        brand: 'Scarlet Beauty',
        tags: ['serum', 'hydrating'],
        images: ['/api/placeholder/100/100'],
        variants: [],
        stock: 0,
        lowStockThreshold: 10,
        trackInventory: true,
        status: 'active',
        stockStatus: 'out_of_stock',
        weight: 0.12,
        dimensions: { length: 12, width: 4, height: 4 },
        seoTitle: 'Hydrating Face Serum',
        seoDescription: 'Hyaluronic acid serum',
        seoKeywords: ['serum'],
        createdAt: '2025-01-10T09:00:00Z',
        updatedAt: '2025-01-17T11:15:00Z',
        salesCount: 89,
        viewCount: 1876,
        rating: 4.9,
        reviewCount: 12,
        // Inventory specific fields
        reorderPoint: 15,
        maxStock: 80,
        reservedStock: 0,
        availableStock: 0,
        lastRestockDate: '2025-01-05T00:00:00Z',
        supplier: 'Premium Skincare Co',
        location: 'Warehouse B-2',
        turnoverRate: 12.3,
      },
      {
        id: '3',
        name: 'Organic Body Butter',
        slug: 'organic-body-butter',
        description: 'Rich, nourishing body butter',
        shortDescription: 'Organic nourishing body butter',
        price: 1800,
        comparePrice: 2200,
        cost: 900,
        sku: 'BB-ORG-003',
        barcode: '1234567890125',
        category: 'Bath & Body',
        subcategory: 'Body Care',
        brand: 'Scarlet Natural',
        tags: ['body butter', 'organic'],
        images: ['/api/placeholder/100/100'],
        variants: [],
        stock: 45,
        lowStockThreshold: 15,
        trackInventory: true,
        status: 'active',
        stockStatus: 'in_stock',
        weight: 0.25,
        dimensions: { length: 8, width: 8, height: 6 },
        seoTitle: 'Organic Body Butter',
        seoDescription: 'Natural moisturizing cream',
        seoKeywords: ['body butter'],
        createdAt: '2025-01-05T08:30:00Z',
        updatedAt: '2025-01-16T16:45:00Z',
        salesCount: 234,
        viewCount: 3210,
        rating: 4.7,
        reviewCount: 45,
        // Inventory specific fields
        reorderPoint: 25,
        maxStock: 120,
        reservedStock: 8,
        availableStock: 37,
        lastRestockDate: '2025-01-12T00:00:00Z',
        supplier: 'Organic Essentials',
        location: 'Warehouse A-3',
        turnoverRate: 15.6,
      },
    ];

    const mockMovements: StockMovement[] = [
      {
        id: '1',
        productId: '1',
        productName: 'Luxury Rose Gold Lipstick',
        type: 'out',
        quantity: -5,
        reason: 'Sale',
        date: '2025-01-18T14:30:00Z',
        user: 'System',
        reference: 'ORDER-001',
      },
      {
        id: '2',
        productId: '2',
        productName: 'Hydrating Face Serum',
        type: 'out',
        quantity: -3,
        reason: 'Sale',
        date: '2025-01-18T12:15:00Z',
        user: 'System',
        reference: 'ORDER-002',
      },
      {
        id: '3',
        productId: '3',
        productName: 'Organic Body Butter',
        type: 'in',
        quantity: 20,
        reason: 'Restock',
        date: '2025-01-17T09:00:00Z',
        user: 'Admin User',
        reference: 'PO-2025-001',
      },
      {
        id: '4',
        productId: '1',
        productName: 'Luxury Rose Gold Lipstick',
        type: 'adjustment',
        quantity: -2,
        reason: 'Damaged items',
        date: '2025-01-16T16:20:00Z',
        user: 'Admin User',
      },
    ];

    // Fetch real data from backend instead of using mock data
    const fetchInventoryData = async () => {
      try {
        // Fetch products from admin API
        const response = await adminApi.products.getProducts({ limit: 100 });
        
        if (response && response.products) {
          // Transform AdminProduct to InventoryItem with inventory-specific data
          const inventoryItems: InventoryItem[] = response.products.map((product: AdminProduct) => ({
            ...product,
            // Add inventory-specific fields with sensible defaults
            reorderPoint: 10,
            maxStock: 100,
            reservedStock: Math.floor(Math.random() * 5), // Mock reserved stock
            availableStock: (product.stock || 0) - Math.floor(Math.random() * 3),
            lastRestockDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            supplier: product.brand || 'Default Supplier',
            location: `Warehouse ${String.fromCharCode(65 + Math.floor(Math.random() * 3))}-${Math.floor(Math.random() * 10) + 1}`,
            turnoverRate: Math.random() * 20 + 5 // Random turnover between 5 and 25
          }));
          
          setInventory(inventoryItems);
          
          // Generate mock stock movements based on real products
          const movements: StockMovement[] = inventoryItems.slice(0, 15).map((product, index) => ({
            id: `mov-${index}`,
            productId: product._id!,
            productName: product.title,
            type: ['in', 'out', 'adjustment'][Math.floor(Math.random() * 3)] as 'in' | 'out' | 'adjustment',
            quantity: Math.floor(Math.random() * 20) + 1,
            reason: ['Sale', 'Restock', 'Damaged', 'Returned', 'Transfer'][Math.floor(Math.random() * 5)],
            date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            user: ['System', 'Admin User', 'Warehouse Manager'][Math.floor(Math.random() * 3)],
            reference: `REF-${String(Math.random()).substr(2, 6)}`
          }));
          
          setStockMovements(movements);
        }
      } catch (error) {
        console.error('Error fetching inventory data:', error);
        addToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load inventory data'
        });
        // Fallback to mock data on error
        setInventory(mockInventory);
        setStockMovements(mockMovements);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, []);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.slug.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'low_stock') return matchesSearch && (item.stock || 0) <= 10 && (item.stock || 0) > 0;
    if (filterStatus === 'out_of_stock') return matchesSearch && (item.stock || 0) === 0;
    if (filterStatus === 'in_stock') return matchesSearch && (item.stock || 0) > 10;
    
    return matchesSearch;
  });

  const handleStockAdjustment = async (productId: string, adjustment: number, reason: string) => {
    try {
      const currentItem = inventory.find(item => item._id === productId);
      if (!currentItem) return;

      const newStock = Math.max(0, (currentItem.stock || 0) + adjustment);
      
      // Update stock via API
      await adminApi.products.updateProductStock(productId, newStock);
      
      // Update local state
      setInventory(prev => prev.map(item => {
        if (item._id === productId) {
          return {
            ...item,
            stock: newStock,
            availableStock: Math.max(0, newStock - item.reservedStock)
          };
        }
        return item;
      }));

      // Add stock movement record
      const newMovement: StockMovement = {
        id: Date.now().toString(),
        productId,
        productName: currentItem.title,
        type: adjustment > 0 ? 'in' : adjustment < 0 ? 'out' : 'adjustment',
        quantity: Math.abs(adjustment),
        reason,
        date: new Date().toISOString(),
        user: 'Admin User',
      };
      setStockMovements(prev => [newMovement, ...prev]);

      addToast({
        type: 'success',
        title: 'Stock adjusted',
        message: `Stock ${adjustment > 0 ? 'increased' : 'decreased'} by ${Math.abs(adjustment)} units.`,
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update stock. Please try again.'
      });
    }
  };

  const getStockStatusColor = (item: InventoryItem) => {
    if (item.stock === 0) return 'text-red-600 bg-red-100';
    if (item.stock <= item.lowStockThreshold) return 'text-amber-600 bg-amber-100';
    return 'text-green-600 bg-green-100';
  };

  const getStockStatusIcon = (item: InventoryItem) => {
    if (item.stock === 0) return <ExclamationTriangleIcon className="w-4 h-4" />;
    if (item.stock <= item.lowStockThreshold) return <ExclamationTriangleIcon className="w-4 h-4" />;
    return <CubeIcon className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="p-8 w-full max-w-none">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 w-full max-w-none">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Inventory Management</h1>
            <p className="text-gray-600">
              Track stock levels, manage inventory, and monitor stock movements
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={() => setShowMovements(!showMovements)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              {showMovements ? 'Hide' : 'Show'} Movements
            </button>
            <button
              onClick={() => {/* Export inventory */}}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <CubeIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-amber-600">
                  {inventory.filter(item => item.stock <= item.lowStockThreshold && item.stock > 0).length}
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
                  {inventory.filter(item => item.stock === 0).length}
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
                <p className="text-sm font-medium text-gray-600">Total Stock Value</p>
                <p className="text-2xl font-bold text-green-600">
                  ৳{inventory.reduce((sum, item) => sum + (item.stock * item.cost), 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-3">
              <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="all">All Items</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Available
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reserved
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reorder Point
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        src={item.images[0] || '/api/placeholder/40/40'}
                        alt={item.title}
                        className="w-10 h-10 rounded-lg object-cover mr-4"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.category}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                    {item.slug}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockStatusColor(item)}`}>
                        {getStockStatusIcon(item)}
                        <span className="ml-1">{item.stock}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.availableStock}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.reservedStock}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${item.stock <= item.reorderPoint ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                      {item.reorderPoint}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ৳{(item.stock * item.cost).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {item.location}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleStockAdjustment(item._id!, 1, 'Manual adjustment')}
                        className="p-1 text-green-600 hover:text-green-900 rounded"
                        title="Increase stock"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStockAdjustment(item._id!, -1, 'Manual adjustment')}
                        className="p-1 text-red-600 hover:text-red-900 rounded"
                        title="Decrease stock"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/admin/products/${item._id}`}
                        className="p-1 text-gray-600 hover:text-gray-900 rounded"
                        title="View product"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/products/${item._id}/edit`}
                        className="p-1 text-blue-600 hover:text-blue-900 rounded"
                        title="Edit product"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Movements */}
      {showMovements && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Stock Movements</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stockMovements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(movement.date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {movement.productName}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        movement.type === 'in' ? 'bg-green-100 text-green-800' :
                        movement.type === 'out' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {movement.type === 'in' ? (
                          <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                        ) : movement.type === 'out' ? (
                          <ArrowTrendingDownIcon className="w-3 h-3 mr-1" />
                        ) : (
                          <AdjustmentsHorizontalIcon className="w-3 h-3 mr-1" />
                        )}
                        {movement.type === 'in' ? 'Stock In' : movement.type === 'out' ? 'Stock Out' : 'Adjustment'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${
                        movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {movement.reason}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {movement.user}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {movement.reference || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
