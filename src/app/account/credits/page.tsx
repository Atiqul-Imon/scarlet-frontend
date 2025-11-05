'use client';

import { useState, useEffect } from 'react';
import { creditApi } from '@/lib/api';
import type { CreditWallet, CreditTransaction, ReferralStats } from '@/lib/types';
import { useToast } from '@/lib/context';
import AccountLayout from '@/components/account/AccountLayout';

export default function CreditsPage() {
  const { addToast } = useToast();
  const [wallet, setWallet] = useState<CreditWallet | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
        const [walletData, codeData, statsData, transactionsData] = await Promise.all([
          creditApi.getWallet().catch(() => null),
          creditApi.getReferralCode().catch(() => ({ referralCode: '' })),
          creditApi.getReferralStats().catch(() => null),
          creditApi.getTransactions(20).catch(() => ({ transactions: [], hasMore: false, nextCursor: undefined }))
        ]);

        setWallet(walletData);
        setReferralCode(codeData.referralCode);
        setReferralStats(statsData);
        setTransactions(transactionsData.transactions);
        setNextCursor(transactionsData.nextCursor);
        setHasMore(transactionsData.hasMore);
    } catch (error) {
      console.error('Failed to load credit data:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load credit information. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMoreTransactions = async () => {
    if (!nextCursor || transactionsLoading) return;

    try {
      setTransactionsLoading(true);
      const data = await creditApi.getTransactions(20, nextCursor);
      setTransactions(prev => [...prev, ...data.transactions]);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Failed to load more transactions:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load more transactions.'
      });
    } finally {
      setTransactionsLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionTypeLabel = (type: CreditTransaction['type']) => {
    switch (type) {
      case 'earned': return 'Earned';
      case 'redeemed': return 'Redeemed';
      case 'refunded': return 'Refunded';
      case 'adjusted': return 'Adjusted';
      default: return type;
    }
  };

  const getTransactionSourceLabel = (source: CreditTransaction['source']) => {
    switch (source) {
      case 'signup': return 'Signup Reward';
      case 'referral': return 'Referral Reward';
      case 'order': return 'Order Reward';
      case 'manual': return 'Manual Adjustment';
      case 'refund': return 'Order Refund';
      default: return source;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <AccountLayout>
      <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Credit Wallet</h1>

      {/* Credit Balance Card */}
      <div className="bg-gradient-to-r from-red-600 to-purple-600 rounded-lg p-6 text-white mb-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-100 text-sm mb-2">Available Credits</p>
            <p className="text-4xl font-bold">{wallet?.balance || 0}</p>
            <p className="text-red-100 text-sm mt-2">
              ≈ {(wallet?.balance || 0) / 10} BDT (100 credits = 10 BDT)
            </p>
          </div>
          <div className="text-right">
            <p className="text-red-100 text-sm mb-2">Total Earned</p>
            <p className="text-2xl font-semibold">{wallet?.totalEarned || 0}</p>
            <p className="text-red-100 text-sm mt-2">Total Redeemed</p>
            <p className="text-2xl font-semibold">{wallet?.totalRedeemed || 0}</p>
          </div>
        </div>
      </div>

      {/* Referral Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Referral Program</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Referral Code</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={referralCode || 'Loading...'}
              readOnly
              className="flex-1 px-4 py-2 border-2 border-gray-400 rounded-lg bg-white font-mono text-lg font-semibold"
              style={{ 
                color: referralCode ? '#111827' : '#9CA3AF',
                backgroundColor: referralCode ? '#FFFFFF' : '#F9FAFB'
              }}
            />
            <button
              onClick={copyReferralCode}
              disabled={!referralCode}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed min-w-[80px]"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Share this code with friends and earn 100 credits when they sign up!
          </p>
        </div>

        {referralStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Referrals</p>
              <p className="text-2xl font-bold text-gray-900">{referralStats.totalReferrals}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Successful</p>
              <p className="text-2xl font-bold text-green-600">{referralStats.successfulReferrals}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Credits Earned</p>
              <p className="text-2xl font-bold text-purple-600">{referralStats.creditsEarned}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-blue-600">
                {referralStats.monthlyReferrals}/{referralStats.monthlyLimit}
              </p>
              {!referralStats.canReferMore && (
                <p className="text-xs text-red-600 mt-1">Limit reached</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Transaction History</h2>
        
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No transactions yet.</p>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${
                      transaction.type === 'earned' || transaction.type === 'refunded'
                        ? 'text-green-600'
                        : transaction.type === 'redeemed'
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}>
                      {transaction.type === 'earned' || transaction.type === 'refunded' ? '+' : '-'}
                      {Math.abs(transaction.amount)} credits
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {getTransactionTypeLabel(transaction.type)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {getTransactionSourceLabel(transaction.source)}
                    {transaction.description && ` • ${transaction.description}`}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(transaction.createdAt)}</p>
                </div>
              </div>
            ))}
            
            {hasMore && (
              <button
                onClick={loadMoreTransactions}
                disabled={transactionsLoading}
                className="w-full py-2 text-center text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {transactionsLoading ? 'Loading...' : 'Load More'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Credit Info */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">How Credits Work</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 100 credits = 10 BDT discount</li>
          <li>• Earn credits by signing up (+100), referring friends (+100), and completing orders (+200)</li>
          <li>• Minimum cart value of 500 BDT required to redeem credits</li>
          <li>• Credits can be redeemed at checkout</li>
          <li>• Credits are refunded if an order is cancelled</li>
        </ul>
      </div>
      </div>
    </AccountLayout>
  );
}
