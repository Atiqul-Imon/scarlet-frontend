"use client";
import * as React from 'react';
import Link from 'next/link';
import { useAuth, useCart } from '../../lib/context';
import AccountLayout from '../../components/account/AccountLayout';
import { Button } from '../../components/ui/button';
import { formatters } from '../../lib/utils';
import { Order, OrderStatus } from '../../lib/types';
import { orderApi } from '../../lib/api';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalSpent: number;
  wishlistItems: number;
  rewardPoints: number;
}

interface RecentOrder {
  _id: string;
  orderNumber: string;
  total: number;
  currency: string;
  status: OrderStatus;
  createdAt: string;
  itemCount: number;
}

export default function AccountDashboard(): JSX.Element {
  const { user } = useAuth();
  const { itemCount, totalPrice } = useCart();
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = React.useState<RecentOrder[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch user's orders
        const ordersResponse = await orderApi.getOrders(1, 10);
        const orders = ordersResponse.data || ordersResponse;
        
        // Calculate stats from real data
        const totalOrders = orders.length;
        const pendingOrders = orders.filter((order: Order) => 
          ['pending', 'confirmed', 'processing', 'shipped'].includes(order.status)
        ).length;
        
        const totalSpent = orders.reduce((sum: number, order: Order) => 
          sum + (order.total || 0), 0
        );
        
        // For now, we'll use placeholder values for wishlist and rewards
        // These would need separate API endpoints
        const stats: DashboardStats = {
          totalOrders,
          pendingOrders,
          totalSpent,
          wishlistItems: 0, // TODO: Implement wishlist API
          rewardPoints: Math.floor(totalSpent), // Simple points calculation
        };

        // Transform orders to RecentOrder format
        const recentOrders: RecentOrder[] = orders.slice(0, 3).map((order: Order) => ({
          _id: order._id || '',
          orderNumber: order.orderNumber,
          total: order.total,
          currency: order.currency,
          status: order.status,
          createdAt: order.createdAt || '',
          itemCount: order.items?.length || 0,
        }));
        
        setStats(stats);
        setRecentOrders(recentOrders);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set empty data on error
        setStats({
          totalOrders: 0,
          pendingOrders: 0,
          totalSpent: 0,
          wishlistItems: 0,
          rewardPoints: 0,
        });
        setRecentOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const getStatusColor = (status: OrderStatus): string => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return (
      <AccountLayout>
        <DashboardSkeleton />
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">
            Welcome back, {user?.firstName || 'Valued Customer'}!
          </h2>
          <p className="text-pink-100">
            Manage your orders, update your profile, and discover new products.
          </p>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <OrdersIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-100">
                  <PendingIcon className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <DollarIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatters.formatPrice(stats.totalSpent, 'BDT')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-pink-100">
                  <HeartIcon className="w-6 h-6 text-pink-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Wishlist Items</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.wishlistItems}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Current Cart & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Cart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Current Cart</h3>
              <Link href="/cart">
                <Button variant="ghost" size="sm">
                  View Cart
                </Button>
              </Link>
            </div>
            
            {itemCount > 0 ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items in cart:</span>
                  <span className="font-medium">{itemCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total value:</span>
                  <span className="font-medium">{formatters.formatPrice(totalPrice, 'BDT')}</span>
                </div>
                <div className="pt-3 border-t">
                  <Link href="/checkout">
                    <Button fullWidth>
                      Proceed to Checkout
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <CartIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-4">Your cart is empty</p>
                <Link href="/products">
                  <Button variant="secondary">
                    Start Shopping
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/account/profile" className="block">
                <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <UserIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">Update Profile</span>
                  <ChevronRightIcon className="w-5 h-5 text-gray-400 ml-auto" />
                </div>
              </Link>
              
              <Link href="/account/addresses" className="block">
                <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <AddressIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">Manage Addresses</span>
                  <ChevronRightIcon className="w-5 h-5 text-gray-400 ml-auto" />
                </div>
              </Link>
              
              <Link href="/account/security" className="block">
                <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <SecurityIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">Security Settings</span>
                  <ChevronRightIcon className="w-5 h-5 text-gray-400 ml-auto" />
                </div>
              </Link>
              
              <Link href="/wishlist" className="block">
                <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <HeartIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">View Wishlist</span>
                  <ChevronRightIcon className="w-5 h-5 text-gray-400 ml-auto" />
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <Link href="/account/orders">
              <Button variant="ghost" size="sm">
                View All Orders
              </Button>
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-medium text-gray-900">
                        {order.orderNumber}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {formatters.formatOrderStatus(order.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}</span>
                      <span>•</span>
                      <span>{formatters.formatDate(order.createdAt)}</span>
                      <span>•</span>
                      <span className="font-medium text-gray-900">
                        {formatters.formatPrice(order.total, order.currency)}
                      </span>
                    </div>
                  </div>
                  <Link href={`/account/orders/${order._id}`}>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <OrdersIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4">No orders yet</p>
              <Link href="/products">
                <Button variant="secondary">
                  Start Shopping
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Rewards Section */}
        {stats && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Scarlet Rewards</h3>
                <p className="text-purple-100 mb-4">
                  You have {stats.rewardPoints} points available
                </p>
                <p className="text-sm text-purple-100">
                  Earn 1 point for every $1 spent. Redeem 100 points for $5 off your next order.
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold mb-2">{stats.rewardPoints}</div>
                <p className="text-sm text-purple-100">Points</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}

function DashboardSkeleton(): JSX.Element {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Welcome Section Skeleton */}
      <div className="bg-gray-200 rounded-lg h-32"></div>
      
      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="ml-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Icon Components
function OrdersIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  );
}

function PendingIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function DollarIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CartIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 12.39A2 2 0 0 0 9.63 15H19a2 2 0 0 0 2-1.59l1.38-7.59H6" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function AddressIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function SecurityIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
