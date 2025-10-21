'use client';

import { useState, useEffect } from 'react';
import { 
  Cog6ToothIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  TruckIcon,
  BellIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { useToast } from '@/lib/context';
import { adminApi } from '@/lib/api';
import type { SystemSettings } from '@/lib/admin-types';

export default function SettingsPage() {
  const { addToast } = useToast();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'store' | 'payment' | 'shipping' | 'notifications' | 'security'>('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await adminApi.settings.getSystemSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      addToast({
        type: 'error',
        title: 'Failed to load settings',
        message: 'Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      await adminApi.settings.updateSystemSettings(settings);
      
      addToast({
        type: 'success',
        title: 'Settings saved',
        message: 'Your changes have been saved successfully.'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      addToast({
        type: 'error',
        title: 'Save failed',
        message: 'Failed to save settings. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (path: string, value: any) => {
    setSettings(prev => {
      if (!prev) return prev;
      const keys = path.split('.');
      const newSettings = { ...prev };
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Cog6ToothIcon },
    { id: 'store', label: 'Store Info', icon: ShoppingBagIcon },
    { id: 'payment', label: 'Payment', icon: CurrencyDollarIcon },
    { id: 'shipping', label: 'Shipping', icon: TruckIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon },
  ] as const;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-1">
            Configure your store settings and preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <span className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving...</span>
            </span>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${isActive
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={settings?.siteName || ''}
                onChange={(e) => updateSetting('siteName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Scarlet Unlimited"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Description
              </label>
              <textarea
                rows={3}
                value={settings?.siteDescription || ''}
                onChange={(e) => updateSetting('siteDescription', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Your premier destination for beauty and cosmetics"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={settings?.contactEmail || ''}
                onChange={(e) => updateSetting('contactEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="support@scarlet.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                value={settings?.contactPhone || ''}
                onChange={(e) => updateSetting('contactPhone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="+880 1234-567890"
              />
            </div>

            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.maintenanceMode || false}
                  onChange={(e) => updateSetting('maintenanceMode', e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Maintenance Mode (Store will be unavailable to customers)
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Store Info */}
        {activeTab === 'store' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Store Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Address
              </label>
              <textarea
                rows={3}
                value={settings?.storeAddress || ''}
                onChange={(e) => updateSetting('storeAddress', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="123 Beauty Street, Dhaka, Bangladesh"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={settings?.currency || 'BDT'}
                  onChange={(e) => updateSetting('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="BDT">BDT (৳)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={settings?.timezone || 'Asia/Dhaka'}
                  onChange={(e) => updateSetting('timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                  <option value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</option>
                  <option value="UTC">UTC (GMT+0)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.allowGuestCheckout || false}
                  onChange={(e) => updateSetting('allowGuestCheckout', e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Allow Guest Checkout
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Payment Settings */}
        {activeTab === 'payment' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Settings</h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <ShieldCheckIcon className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-900 mb-1">
                    Sensitive Information
                  </h4>
                  <p className="text-sm text-yellow-700">
                    Payment gateway credentials are stored securely in environment variables. 
                    Contact your system administrator to update payment API keys.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={settings?.paymentMethods?.bkash || false}
                  onChange={(e) => updateSetting('paymentMethods.bkash', e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Enable bKash
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={settings?.paymentMethods?.nagad || false}
                  onChange={(e) => updateSetting('paymentMethods.nagad', e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Enable Nagad
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={settings?.paymentMethods?.sslcommerz || false}
                  onChange={(e) => updateSetting('paymentMethods.sslcommerz', e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Enable SSLCommerz (Card/Mobile Banking)
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.paymentMethods?.cod || false}
                  onChange={(e) => updateSetting('paymentMethods.cod', e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Enable Cash on Delivery
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Shipping Settings */}
        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Settings</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Shipping Cost (৳)
              </label>
              <input
                type="number"
                value={settings?.defaultShippingCost || 0}
                onChange={(e) => updateSetting('defaultShippingCost', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Free Shipping Threshold (৳)
              </label>
              <input
                type="number"
                value={settings?.freeShippingThreshold || 0}
                onChange={(e) => updateSetting('freeShippingThreshold', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="1000"
              />
              <p className="text-sm text-gray-500 mt-1">
                Orders above this amount will have free shipping
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Delivery Time (days)
              </label>
              <input
                type="number"
                value={settings?.estimatedDeliveryDays || 3}
                onChange={(e) => updateSetting('estimatedDeliveryDays', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="3-5"
              />
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h2>
            
            <div>
              <label className="flex items-center space-x-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={settings?.notifications?.orderConfirmation || false}
                  onChange={(e) => updateSetting('notifications.orderConfirmation', e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Send order confirmation emails
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={settings?.notifications?.orderStatusUpdate || false}
                  onChange={(e) => updateSetting('notifications.orderStatusUpdate', e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Send order status update notifications
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={settings?.notifications?.lowStockAlert || false}
                  onChange={(e) => updateSetting('notifications.lowStockAlert', e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Send low stock alerts to admin
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.notifications?.newOrderAlert || false}
                  onChange={(e) => updateSetting('notifications.newOrderAlert', e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Send new order alerts to admin
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notification Email
              </label>
              <input
                type="email"
                value={settings?.adminEmail || ''}
                onChange={(e) => updateSetting('adminEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="admin@scarlet.com"
              />
            </div>
          </div>
        )}

        {/* Security */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <ShieldCheckIcon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-900 mb-1">
                    Security Best Practices
                  </h4>
                  <p className="text-sm text-red-700">
                    Keep your admin credentials secure. Enable two-factor authentication when available.
                    Regularly review activity logs for suspicious behavior.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={settings?.security?.requireEmailVerification || false}
                  onChange={(e) => updateSetting('security.requireEmailVerification', e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Require email verification for new accounts
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={settings?.security?.enableRateLimiting || false}
                  onChange={(e) => updateSetting('security.enableRateLimiting', e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Enable rate limiting for API requests
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.security?.logAdminActions || false}
                  onChange={(e) => updateSetting('security.logAdminActions', e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Log all admin actions
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={settings?.security?.sessionTimeout || 60}
                onChange={(e) => updateSetting('security.sessionTimeout', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="60"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

