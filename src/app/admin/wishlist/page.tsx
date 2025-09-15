"use client";
import * as React from 'react';
import { useToast } from '../../../lib/context';
import { wishlistApi } from '../../../lib/api';
import { OutOfStockWishlistItem } from '../../../lib/types';

export default function AdminWishlistPage() {
  const { addToast } = useToast();
  const [wishlistItems, setWishlistItems] = React.useState<OutOfStockWishlistItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
  const [filterPriority, setFilterPriority] = React.useState<string>('all');
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    fetchOutOfStockWishlistItems();
  }, []);

  const fetchOutOfStockWishlistItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await wishlistApi.getOutOfStockItems();
      setWishlistItems(items);
    } catch (err: any) {
      console.error('Error fetching out-of-stock wishlist items:', err);
      setError(err.message || 'Failed to load wishlist items');
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load out-of-stock wishlist items'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNotifyCustomers = async (productId: string) => {
    try {
      const result = await wishlistApi.notifyCustomersAboutRestock(productId, {
        message: 'Great news! This product is back in stock.',
        estimatedRestockDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      });
      
      addToast({
        type: 'success',
        title: 'Notifications Sent',
        message: `Notified ${result.notified} customers about product restock`
      });
      
      // Refresh the list
      await fetchOutOfStockWishlistItems();
    } catch (err: any) {
      console.error('Error notifying customers:', err);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to notify customers'
      });
    }
  };

  const handleUpdatePriority = async (wishlistItemId: string, priority: 'low' | 'medium' | 'high') => {
    try {
      await wishlistApi.updateWishlistItemPriority(wishlistItemId, {
        priority,
        estimatedRestockDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days from now
      });
      
      addToast({
        type: 'success',
        title: 'Priority Updated',
        message: 'Wishlist item priority updated successfully'
      });
      
      // Refresh the list
      await fetchOutOfStockWishlistItems();
    } catch (err: any) {
      console.error('Error updating priority:', err);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update priority'
      });
    }
  };

  const filteredItems = wishlistItems.filter(item => {
    const matchesSearch = item.product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.customer.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = filterPriority === 'all' || item.priority === filterPriority;
    
    return matchesSearch && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'High Priority';
      case 'medium': return 'Medium Priority';
      case 'low': return 'Low Priority';
      default: return 'Unknown';
    }
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
            onClick={fetchOutOfStockWishlistItems}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Out-of-Stock Wishlist Management</h1>
        <p className="text-gray-600">Manage customer wishlist items for out-of-stock products</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by product name, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          <div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{wishlistItems.length}</div>
          <div className="text-sm text-gray-600">Total Items</div>
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

      {/* Wishlist Items */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <HeartIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No wishlist items found</h3>
            <p className="text-gray-600">
              {searchTerm || filterPriority !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No out-of-stock products have been added to wishlists yet.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                    Notes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                          {item.product.images && item.product.images.length > 0 ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="text-gray-400 text-xs">No Image</div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.product.title}</div>
                          <div className="text-sm text-gray-500">৳{item.product.price.amount.toLocaleString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.customer.firstName} {item.customer.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{item.customer.email}</div>
                        {item.customer.phone && (
                          <div className="text-sm text-gray-500">{item.customer.phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(item.priority || 'low')}`}>
                          {getPriorityBadge(item.priority || 'low')}
                        </span>
                        <select
                          value={item.priority || 'low'}
                          onChange={(e) => handleUpdatePriority(item._id!, e.target.value as 'low' | 'medium' | 'high')}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.addedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {item.customerNotes || 'No notes'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleNotifyCustomers(item.productId)}
                          className="text-pink-600 hover:text-pink-900 bg-pink-50 hover:bg-pink-100 px-3 py-1 rounded-md text-xs font-medium transition-colors"
                        >
                          Notify Customers
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
