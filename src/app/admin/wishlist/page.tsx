"use client";
import * as React from 'react';
import { useToast } from '../../../lib/context';
import { wishlistApi } from '../../../lib/api';
import { OutOfStockWishlistItem, WishlistAnalytics } from '../../../lib/types';

export default function AdminWishlistPage() {
  const { addToast } = useToast();
  const [wishlistItems, setWishlistItems] = React.useState<OutOfStockWishlistItem[]>([]);
  const [analytics, setAnalytics] = React.useState<WishlistAnalytics | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [analyticsLoading, setAnalyticsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
  const [filterPriority, setFilterPriority] = React.useState<string>('all');
  const [filterNotification, setFilterNotification] = React.useState<string>('all');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortBy, setSortBy] = React.useState<'addedAt' | 'priority' | 'productName' | 'customerName'>('addedAt');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(20);
  const [showAnalytics, setShowAnalytics] = React.useState(false);
  const [bulkAction, setBulkAction] = React.useState<string>('');
  const [isProcessing, setIsProcessing] = React.useState(false);

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([
      fetchOutOfStockWishlistItems(),
      fetchWishlistAnalytics()
    ]);
  };

  const fetchOutOfStockWishlistItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await wishlistApi.getOutOfStockItems();
      setWishlistItems(items || []);
    } catch (err: any) {
      console.error('Error fetching out-of-stock wishlist items:', err);
      const errorMessage = err?.message || 'Failed to load wishlist items';
      setError(errorMessage);
      addToast({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlistAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const analyticsData = await wishlistApi.getWishlistAnalytics();
      setAnalytics(analyticsData || null);
    } catch (err: any) {
      console.error('Error fetching wishlist analytics:', err);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load wishlist analytics'
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleNotifyCustomers = async (productId: string) => {
    if (!productId) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Product ID is required'
      });
      return;
    }

    setIsProcessing(true);
    try {
      const result = await wishlistApi.notifyCustomersAboutRestock(productId, {
        message: 'Great news! This product is back in stock.',
        estimatedRestockDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });
      
      addToast({
        type: 'success',
        title: 'Notifications Sent',
        message: `Notified ${result?.notified || 0} customers about product restock`
      });
      
      await fetchOutOfStockWishlistItems();
    } catch (err: any) {
      console.error('Error notifying customers:', err);
      addToast({
        type: 'error',
        title: 'Error',
        message: err?.message || 'Failed to notify customers'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdatePriority = async (wishlistItemId: string, priority: 'low' | 'medium' | 'high') => {
    if (!wishlistItemId) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Wishlist item ID is required'
      });
      return;
    }

    setIsProcessing(true);
    try {
      await wishlistApi.updateWishlistItemPriority(wishlistItemId, {
        priority,
        estimatedRestockDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      });
      
      addToast({
        type: 'success',
        title: 'Priority Updated',
        message: 'Wishlist item priority updated successfully'
      });
      
      await fetchOutOfStockWishlistItems();
    } catch (err: any) {
      console.error('Error updating priority:', err);
      addToast({
        type: 'error',
        title: 'Error',
        message: err?.message || 'Failed to update priority'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkAction = async () => {
    if (selectedItems.length === 0) {
      addToast({
        type: 'error',
        title: 'No Items Selected',
        message: 'Please select items to perform bulk action'
      });
      return;
    }

    if (!bulkAction) {
      addToast({
        type: 'error',
        title: 'No Action Selected',
        message: 'Please select an action to perform'
      });
      return;
    }

    setIsProcessing(true);
    try {
      if (bulkAction === 'notify') {
        // Get unique product IDs from selected items
        const productIds = [...new Set(selectedItems.map(id => {
          const item = wishlistItems.find(item => item._id === id);
          return item?.productId;
        }).filter(Boolean))];

        for (const productId of productIds) {
          if (productId) {
            await handleNotifyCustomers(productId);
          }
        }
      } else if (bulkAction === 'priority_high') {
        for (const itemId of selectedItems) {
          await handleUpdatePriority(itemId, 'high');
        }
      } else if (bulkAction === 'priority_medium') {
        for (const itemId of selectedItems) {
          await handleUpdatePriority(itemId, 'medium');
        }
      } else if (bulkAction === 'priority_low') {
        for (const itemId of selectedItems) {
          await handleUpdatePriority(itemId, 'low');
        }
      }

      setSelectedItems([]);
      setBulkAction('');
      addToast({
        type: 'success',
        title: 'Bulk Action Completed',
        message: `Successfully processed ${selectedItems.length} items`
      });
    } catch (err: any) {
      console.error('Error performing bulk action:', err);
      addToast({
        type: 'error',
        title: 'Error',
        message: err?.message || 'Failed to perform bulk action'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredAndSortedItems = React.useMemo(() => {
    let filtered = wishlistItems.filter(item => {
      if (!item) return false;
      
      const matchesSearch = !searchTerm || 
        (item.product?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         item.customer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         item.customer?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         item.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesPriority = filterPriority === 'all' || item.priority === filterPriority;
      
      const matchesNotification = filterNotification === 'all' || 
        (filterNotification === 'notified' && item.notificationSent) ||
        (filterNotification === 'pending' && !item.notificationSent);
      
      return matchesSearch && matchesPriority && matchesNotification;
    });

    // Sort items
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'addedAt':
          aValue = new Date(a.addedAt || 0).getTime();
          bValue = new Date(b.addedAt || 0).getTime();
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority || 'low'];
          bValue = priorityOrder[b.priority || 'low'];
          break;
        case 'productName':
          aValue = a.product?.title || '';
          bValue = b.product?.title || '';
          break;
        case 'customerName':
          aValue = `${a.customer?.firstName || ''} ${a.customer?.lastName || ''}`.trim();
          bValue = `${b.customer?.firstName || ''} ${b.customer?.lastName || ''}`.trim();
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [wishlistItems, searchTerm, filterPriority, filterNotification, sortBy, sortOrder]);

  const paginatedItems = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedItems, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'high': return 'High Priority';
      case 'medium': return 'Medium Priority';
      case 'low': return 'Low Priority';
      default: return 'Unknown';
    }
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '৳0';
    return `৳${amount.toLocaleString()}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Wishlist</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">Wishlist Management</h1>
          <p className="text-gray-600 mt-1">Manage customer wishlist items and out-of-stock notifications</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </button>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 font-display">Wishlist Analytics</h2>
          {analyticsLoading ? (
            <div className="animate-pulse grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-300 rounded"></div>
              ))}
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{analytics.totalWishlistItems || 0}</div>
                  <div className="text-sm text-blue-600">Total Wishlist Items</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">{analytics.outOfStockItems || 0}</div>
                  <div className="text-sm text-red-600">Out of Stock</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{analytics.inStockItems || 0}</div>
                  <div className="text-sm text-green-600">In Stock</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">{wishlistItems.length}</div>
                  <div className="text-sm text-purple-600">Out-of-Stock Wishlist</div>
                </div>
              </div>

              {/* Most Wished Products */}
              {analytics.mostWishedProducts && analytics.mostWishedProducts.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Most Wished Products</h3>
                  <div className="space-y-2">
                    {analytics.mostWishedProducts.slice(0, 5).map((product, index) => (
                      <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </span>
                          <span className="font-medium">{product.productName || 'Unknown Product'}</span>
                          {product.isOutOfStock && (
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">Out of Stock</span>
                          )}
                        </div>
                        <span className="text-sm text-gray-600">{product.wishlistCount} wishes</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No analytics data available</div>
          )}
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search products, customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notification Status</label>
            <select
              value={filterNotification}
              onChange={(e) => setFilterNotification(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Status</option>
              <option value="notified">Notified</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="addedAt">Date Added</option>
                <option value="priority">Priority</option>
                <option value="productName">Product Name</option>
                <option value="customerName">Customer Name</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-yellow-800">
              {selectedItems.length} item(s) selected
            </span>
            <div className="flex gap-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Select Action</option>
                <option value="notify">Notify Customers</option>
                <option value="priority_high">Set High Priority</option>
                <option value="priority_medium">Set Medium Priority</option>
                <option value="priority_low">Set Low Priority</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction || isProcessing}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Apply'}
              </button>
              <button
                onClick={() => setSelectedItems([])}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{wishlistItems.length}</div>
          <div className="text-sm text-gray-600">Total Out-of-Stock Items</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">
            {wishlistItems.filter(item => item.priority === 'high').length}
          </div>
          <div className="text-sm text-gray-600">High Priority</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {wishlistItems.filter(item => item.priority === 'medium').length}
          </div>
          <div className="text-sm text-gray-600">Medium Priority</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-600">
            {wishlistItems.filter(item => item.priority === 'low').length}
          </div>
          <div className="text-sm text-gray-600">Low Priority</div>
        </div>
      </div>

      {/* Wishlist Items Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {paginatedItems.length === 0 ? (
          <div className="text-center py-12">
            <HeartIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No wishlist items found</h3>
            <p className="text-gray-600">
              {searchTerm || filterPriority !== 'all' || filterNotification !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No out-of-stock products have been added to wishlists yet.'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === paginatedItems.length && paginatedItems.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems(paginatedItems.map(item => item._id).filter(Boolean) as string[]);
                          } else {
                            setSelectedItems([]);
                          }
                        }}
                        className="rounded border-gray-300 text-red-700 focus:ring-red-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Added Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedItems.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item._id || '')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems([...selectedItems, item._id || '']);
                            } else {
                              setSelectedItems(selectedItems.filter(id => id !== item._id));
                            }
                          }}
                          className="rounded border-gray-300 text-red-700 focus:ring-red-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                            {item.product?.images && item.product.images.length > 0 ? (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.title || 'Product'}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="text-gray-400 text-xs">No Image</div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.product?.title || 'Unknown Product'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatCurrency(item.product?.price?.amount)}
                            </div>
                            {item.product?.brand && (
                              <div className="text-xs text-gray-400">{item.product.brand}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.customer?.firstName || 'Unknown'} {item.customer?.lastName || ''}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.customer?.email || 'No email'}
                          </div>
                          {item.customer?.phone && (
                            <div className="text-sm text-gray-500">{item.customer.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(item.priority)}`}>
                            {getPriorityBadge(item.priority)}
                          </span>
                          <select
                            value={item.priority || 'low'}
                            onChange={(e) => handleUpdatePriority(item._id || '', e.target.value as 'low' | 'medium' | 'high')}
                            disabled={isProcessing}
                            className="text-xs border border-gray-300 rounded px-2 py-1 disabled:opacity-50"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(item.addedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.notificationSent 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.notificationSent ? 'Notified' : 'Pending'}
                          </span>
                          {item.estimatedRestockDate && (
                            <span className="text-xs text-gray-500">
                              Restock: {formatDate(item.estimatedRestockDate)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleNotifyCustomers(item.productId)}
                            disabled={isProcessing || item.notificationSent}
                            className="text-red-700 hover:text-red-950 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {item.notificationSent ? 'Notified' : 'Notify'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                      {' '}to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, filteredAndSortedItems.length)}
                      </span>
                      {' '}of{' '}
                      <span className="font-medium">{filteredAndSortedItems.length}</span>
                      {' '}results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        const isCurrentPage = page === currentPage;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              isCurrentPage
                                ? 'z-10 bg-red-50 border-red-500 text-red-700'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Icon Components
function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function ExclamationTriangleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  );
}