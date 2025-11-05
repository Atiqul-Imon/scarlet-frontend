'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { useToast } from '@/lib/context';
import {
  ChartBarIcon,
  CreditCardIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

type Tab = 'stats' | 'transactions' | 'referrals' | 'suspicious' | 'adjust';

export default function AdminCreditsPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [loading, setLoading] = useState(true);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Credit Management</h1>
            <p className="text-gray-600 mt-1">Manage credits, referrals, and fraud detection</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <ChartBarIcon className="w-5 h-5 mr-2" />
                Statistics
              </div>
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transactions'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <CreditCardIcon className="w-5 h-5 mr-2" />
                Transactions
              </div>
            </button>
            <button
              onClick={() => setActiveTab('referrals')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'referrals'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <UserGroupIcon className="w-5 h-5 mr-2" />
                Referrals
              </div>
            </button>
            <button
              onClick={() => setActiveTab('suspicious')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'suspicious'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                Suspicious Activity
              </div>
            </button>
            <button
              onClick={() => setActiveTab('adjust')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'adjust'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
                Adjust Credits
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'stats' && <StatsTab />}
          {activeTab === 'transactions' && <TransactionsTab />}
          {activeTab === 'referrals' && <ReferralsTab />}
          {activeTab === 'suspicious' && <SuspiciousTab />}
          {activeTab === 'adjust' && <AdjustTab />}
        </div>
      </div>
    </div>
  );
}

// Statistics Tab
function StatsTab() {
  const { addToast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await adminApi.credits.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load credit stats:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load credit statistics'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-r-transparent"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No statistics available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Credits Issued</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">{stats.totalCreditsIssued?.toLocaleString() || 0}</p>
              <p className="text-xs text-purple-600 mt-1">≈ {(stats.totalCreditsIssued / 10 || 0).toFixed(2)} BDT</p>
            </div>
            <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">
              <CreditCardIcon className="w-6 h-6 text-purple-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Credits Redeemed</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{stats.totalCreditsRedeemed?.toLocaleString() || 0}</p>
              <p className="text-xs text-green-600 mt-1">≈ {(stats.totalCreditsRedeemed / 10 || 0).toFixed(2)} BDT</p>
            </div>
            <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
              <ArrowPathIcon className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Active Wallets</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{stats.totalActiveWallets || 0}</p>
              <p className="text-xs text-blue-600 mt-1">With balance &gt; 0</p>
            </div>
            <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
              <UserGroupIcon className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Successful Referrals</p>
              <p className="text-3xl font-bold text-orange-900 mt-2">{stats.successfulReferrals || 0}</p>
              <p className="text-xs text-orange-600 mt-1">of {stats.totalReferrals || 0} total</p>
            </div>
            <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-orange-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Referrers */}
      {stats.topReferrers && stats.topReferrers.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Referrers</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referrals</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits Earned</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.topReferrers.map((referrer: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-mono">{referrer.userId}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{referrer.referralCount}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-purple-600">{referrer.creditsEarned}</td>
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

// Transactions Tab
function TransactionsTab() {
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<any>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, [page, filters]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await adminApi.credits.getTransactions(filters, page, 50);
      setTransactions(response.transactions || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load credit transactions'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'earned':
      case 'refunded':
        return 'text-green-600 bg-green-50';
      case 'redeemed':
        return 'text-red-600 bg-red-50';
      case 'adjusted':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <FunnelIcon className="w-4 h-4 mr-2" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
              <input
                type="text"
                value={filters.userId || ''}
                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Enter user ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type || ''}
                onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Types</option>
                <option value="earned">Earned</option>
                <option value="redeemed">Redeemed</option>
                <option value="refunded">Refunded</option>
                <option value="adjusted">Adjusted</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select
                value={filters.source || ''}
                onChange={(e) => setFilters({ ...filters, source: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Sources</option>
                <option value="signup">Signup</option>
                <option value="referral">Referral</option>
                <option value="order">Order</option>
                <option value="manual">Manual</option>
                <option value="refund">Refund</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-r-transparent"></div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatDate(tx.createdAt)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-600">{tx.userId}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(tx.type)}`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm font-semibold ${
                          tx.type === 'earned' || tx.type === 'refunded' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {tx.type === 'earned' || tx.type === 'refunded' ? '+' : '-'}
                          {Math.abs(tx.amount)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{tx.source}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{tx.description || 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Referrals Tab
function ReferralsTab() {
  const { addToast } = useToast();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<any>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadReferrals();
  }, [page, filters]);

  const loadReferrals = async () => {
    try {
      setLoading(true);
      const response = await adminApi.credits.getReferrals(filters, page, 50);
      setReferrals(response.referrals || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Failed to load referrals:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load referrals'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <FunnelIcon className="w-4 h-4 mr-2" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Referrer ID</label>
              <input
                type="text"
                value={filters.referrerId || ''}
                onChange={(e) => setFilters({ ...filters, referrerId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Enter referrer ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Referrals Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-r-transparent"></div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referrer ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referred ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reward Awarded</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {referrals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        No referrals found
                      </td>
                    </tr>
                  ) : (
                    referrals.map((ref) => (
                      <tr key={ref._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatDate(ref.createdAt)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-600">{ref.referrerId}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-600">{ref.referredId}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-purple-600">{ref.referralCode}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ref.status)}`}>
                            {ref.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {ref.rewardAwardedToReferrer ? '✓ Yes' : '✗ No'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Suspicious Referrals Tab
function SuspiciousTab() {
  const { addToast } = useToast();
  const [suspicious, setSuspicious] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuspicious();
  }, []);

  const loadSuspicious = async () => {
    try {
      setLoading(true);
      const response = await adminApi.credits.getSuspiciousReferrals();
      setSuspicious(response.referrals || []);
    } catch (error) {
      console.error('Failed to load suspicious referrals:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load suspicious referrals'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-semibold text-yellow-800">Fraud Detection</h3>
            <p className="text-sm text-yellow-700 mt-1">
              This section shows referrals that may be fraudulent based on same IP address or device fingerprint within 24 hours.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-r-transparent"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referrer ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referred ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {suspicious.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No suspicious referrals found
                    </td>
                  </tr>
                ) : (
                  suspicious.map((ref) => (
                    <tr key={ref._id} className="hover:bg-red-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatDate(ref.createdAt)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-600">{ref.referrerId}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-600">{ref.referredId}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-red-600">{ref.ipAddress || 'N/A'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full text-red-600 bg-red-50">
                          {ref.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Adjust Credits Tab
function AdjustTab() {
  const { addToast } = useToast();
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const [loadingWallet, setLoadingWallet] = useState(false);

  const loadWallet = async () => {
    if (!userId) {
      setWallet(null);
      return;
    }

    try {
      setLoadingWallet(true);
      const data = await adminApi.credits.getUserWallet(userId);
      setWallet(data);
    } catch (error) {
      console.error('Failed to load wallet:', error);
      setWallet(null);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load user wallet. User may not exist.'
      });
    } finally {
      setLoadingWallet(false);
    }
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || !amount || !reason) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all fields'
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum === 0) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Amount must be a non-zero number'
      });
      return;
    }

    try {
      setLoading(true);
      await adminApi.credits.adjustUserCredits(userId, amountNum, reason);
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Credits adjusted successfully'
      });
      setUserId('');
      setAmount('');
      setReason('');
      setWallet(null);
    } catch (error: any) {
      console.error('Failed to adjust credits:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to adjust credits'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AdjustmentsHorizontalIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-semibold text-blue-800">Manual Credit Adjustment</h3>
            <p className="text-sm text-blue-700 mt-1">
              Use this tool to manually adjust a user's credit balance. Positive amounts add credits, negative amounts remove credits.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleAdjust} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">User ID *</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                if (e.target.value) {
                  setTimeout(() => loadWallet(), 500); // Debounce
                } else {
                  setWallet(null);
                }
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-mono"
              placeholder="Enter user ID"
              required
            />
            <button
              type="button"
              onClick={loadWallet}
              disabled={!userId || loadingWallet}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingWallet ? 'Loading...' : 'Load Wallet'}
            </button>
          </div>
        </div>

        {wallet && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-purple-900 mb-2">Current Wallet Status</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-purple-600">Balance</p>
                <p className="text-lg font-bold text-purple-900">{wallet.balance}</p>
              </div>
              <div>
                <p className="text-xs text-purple-600">Total Earned</p>
                <p className="text-lg font-bold text-purple-900">{wallet.totalEarned}</p>
              </div>
              <div>
                <p className="text-xs text-purple-600">Total Redeemed</p>
                <p className="text-lg font-bold text-purple-900">{wallet.totalRedeemed}</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Enter amount (positive to add, negative to remove)"
            required
            step="0.01"
          />
          <p className="text-xs text-gray-500 mt-1">Positive numbers add credits, negative numbers remove credits</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Enter reason for adjustment (e.g., 'Refund for cancelled order', 'Compensation for service issue')"
            rows={3}
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !userId || !amount || !reason}
            className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adjusting...' : 'Adjust Credits'}
          </button>
        </div>
      </form>
    </div>
  );
}

