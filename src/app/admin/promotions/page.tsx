'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  GiftIcon,
  CalendarIcon,
  PercentBadgeIcon
} from '@heroicons/react/24/outline';
import { useToast } from '@/lib/context';

interface Promotion {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
  minimumPurchase?: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
}

export default function PromotionsPage() {
  const { addToast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const data = await adminApi.promotions.getAll();
      // setPromotions(data);
      
      // For now, show empty state
      setPromotions([]);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      addToast({
        type: 'error',
        title: 'Failed to load promotions',
        message: 'Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteId(id);
      // TODO: Implement API call
      // await adminApi.promotions.delete(id);
      
      setPromotions(prev => prev.filter(p => p._id !== id));
      addToast({
        type: 'success',
        title: 'Promotion deleted',
        message: 'The promotion has been removed successfully.'
      });
    } catch (error) {
      console.error('Error deleting promotion:', error);
      addToast({
        type: 'error',
        title: 'Delete failed',
        message: 'Failed to delete promotion. Please try again.'
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      // TODO: Implement API call
      // await adminApi.promotions.updateStatus(id, !currentStatus);
      
      setPromotions(prev => prev.map(p => 
        p._id === id ? { ...p, isActive: !currentStatus } : p
      ));
      
      addToast({
        type: 'success',
        title: 'Status updated',
        message: `Promotion ${!currentStatus ? 'activated' : 'deactivated'} successfully.`
      });
    } catch (error) {
      console.error('Error updating promotion:', error);
      addToast({
        type: 'error',
        title: 'Update failed',
        message: 'Failed to update promotion status.'
      });
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'percentage': return 'Percentage Off';
      case 'fixed': return 'Fixed Amount';
      case 'free_shipping': return 'Free Shipping';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'percentage': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'fixed': return 'bg-green-100 text-green-800 border-green-200';
      case 'free_shipping': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 gap-4 mt-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotions & Discounts</h1>
          <p className="text-gray-600 mt-1">
            Create and manage promotional codes and discounts
          </p>
        </div>
        <Link
          href="/admin/promotions/new"
          className="flex items-center space-x-2 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Create Promotion</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TagIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Promotions</p>
              <p className="text-2xl font-bold text-gray-900">
                {promotions.filter(p => p.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <GiftIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Promotions</p>
              <p className="text-2xl font-bold text-gray-900">{promotions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <PercentBadgeIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Uses</p>
              <p className="text-2xl font-bold text-gray-900">
                {promotions.reduce((sum, p) => sum + p.usageCount, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Promotions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {promotions.length === 0 ? (
          <div className="text-center py-12">
            <GiftIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Promotions Yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first promotion to boost sales and reward customers.
            </p>
            <Link
              href="/admin/promotions/new"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Create First Promotion</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valid Until
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {promotions.map((promotion) => (
                  <tr key={promotion._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <TagIcon className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {promotion.code}
                          </div>
                          <div className="text-sm text-gray-500">
                            {promotion.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(promotion.type)}`}>
                        {getTypeLabel(promotion.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {promotion.type === 'percentage' ? `${promotion.value}%` : 
                       promotion.type === 'fixed' ? `৳${promotion.value}` : 
                       'Free'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {promotion.usageCount}
                      {promotion.usageLimit && ` / ${promotion.usageLimit}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(promotion.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(promotion._id, promotion.isActive)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                          promotion.isActive
                            ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                        } transition-colors`}
                      >
                        {promotion.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/admin/promotions/${promotion._id}/edit`}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(promotion._id)}
                          disabled={deleteId === promotion._id}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded disabled:opacity-50"
                        >
                          {deleteId === promotion._id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <TrashIcon className="w-4 h-4" />
                          )}
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

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <GiftIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              About Promotions
            </h4>
            <p className="text-sm text-blue-700">
              Promotions help boost sales and reward loyal customers. You can create percentage discounts, 
              fixed amount discounts, or free shipping offers. Set usage limits, minimum purchase requirements, 
              and validity periods to control your promotions effectively.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

