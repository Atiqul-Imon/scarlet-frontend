'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  ClockIcon,
  UserIcon,
  ComputerDesktopIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { adminApi } from '@/lib/api';
import type { AdminActivityLog, AdminActivityLogFilters, AdminActivityStats } from '@/lib/admin-types';
import ErrorDisplay, { createUserFriendlyError } from '../../../components/admin/ErrorDisplay';
import { LoadingCard } from '../../../components/admin/LoadingState';
import { EmptyLogsState } from '../../../components/admin/EmptyState';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [stats, setStats] = useState<AdminActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(50);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState<Partial<AdminActivityLogFilters>>({
    search: '',
    action: '',
    resourceType: '',
    userEmail: '',
    ip: '',
    dateFrom: '',
    dateTo: ''
  });

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build filter object (remove empty values)
      const activeFilters: AdminActivityLogFilters = {};
      if (filters.search) activeFilters.search = filters.search;
      if (filters.action) activeFilters.action = filters.action;
      if (filters.resourceType) activeFilters.resourceType = filters.resourceType;
      if (filters.severity) activeFilters.severity = filters.severity;
      if (filters.userEmail) activeFilters.userEmail = filters.userEmail;
      if (filters.ip) activeFilters.ip = filters.ip;
      if (filters.dateFrom) activeFilters.dateFrom = filters.dateFrom;
      if (filters.dateTo) activeFilters.dateTo = filters.dateTo;
      
      const data = await adminApi.logs.getActivityLogs(activeFilters, page, limit);
      setLogs(data?.data || []);
      setTotal(data?.total || 0);
      setTotalPages(data?.totalPages || 1);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError(err);
      setLogs([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await adminApi.logs.getActivityStats(
        filters.dateFrom || undefined,
        filters.dateTo || undefined
      );
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [filters.dateFrom, filters.dateTo]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setExporting(true);
      
      // Build filter object
      const activeFilters: AdminActivityLogFilters = {};
      if (filters.search) activeFilters.search = filters.search;
      if (filters.action) activeFilters.action = filters.action;
      if (filters.resourceType) activeFilters.resourceType = filters.resourceType;
      if (filters.severity) activeFilters.severity = filters.severity;
      if (filters.userEmail) activeFilters.userEmail = filters.userEmail;
      if (filters.ip) activeFilters.ip = filters.ip;
      if (filters.dateFrom) activeFilters.dateFrom = filters.dateFrom;
      if (filters.dateTo) activeFilters.dateTo = filters.dateTo;
      
      const blob = await adminApi.logs.exportActivityLogs(activeFilters, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting logs:', err);
      alert('Failed to export logs. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      action: '',
      resourceType: '',
      userEmail: '',
      ip: '',
      dateFrom: '',
      dateTo: ''
    });
    setPage(1);
  };

  const getActionColor = (action: string) => {
    const actionUpper = action.toUpperCase();
    if (actionUpper.includes('CREATE') || actionUpper.includes('ADD')) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (actionUpper.includes('UPDATE') || actionUpper.includes('EDIT')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (actionUpper.includes('DELETE') || actionUpper.includes('REMOVE')) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    if (actionUpper.includes('VIEW') || actionUpper.includes('READ')) {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
    return 'bg-purple-100 text-purple-800 border-purple-200';
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'error':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getSeverityIcon = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return <XCircleIcon className="w-4 h-4" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'info':
      default:
        return <InformationCircleIcon className="w-4 h-4" />;
    }
  };

  const getResourceTypeColor = (resourceType?: string) => {
    const colors: Record<string, string> = {
      product: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      order: 'bg-purple-100 text-purple-800 border-purple-200',
      user: 'bg-pink-100 text-pink-800 border-pink-200',
      category: 'bg-teal-100 text-teal-800 border-teal-200',
      settings: 'bg-amber-100 text-amber-800 border-amber-200',
      analytics: 'bg-cyan-100 text-cyan-800 border-cyan-200'
    };
    return colors[resourceType || ''] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatAction = (action: string) => {
    return action.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 8640000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  const formatDetailsForAdmin = (log: AdminActivityLog) => {
    const readableDetails: Array<{ label: string; value: string | React.ReactNode }> = [];
    
    // Resource information
    if (log.resourceType && log.resourceId) {
      const resourceName = log.resourceType.charAt(0).toUpperCase() + log.resourceType.slice(1);
      readableDetails.push({
        label: 'Resource',
        value: `${resourceName} (ID: ${log.resourceId.substring(0, 8)}...)`
      });
    }
    
    // Extract meaningful information from details
    if (log.details) {
      const details = log.details as any;
      
      // Extract from params (URL parameters)
      if (details['params'] && Object.keys(details['params']).length > 0) {
        Object.entries(details['params']).forEach(([key, value]) => {
          const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
          readableDetails.push({
            label: label,
            value: String(value)
          });
        });
      }
      
      // Extract from query (query string parameters)
      if (details['query'] && Object.keys(details['query']).length > 0) {
        const queryEntries = Object.entries(details['query']);
        // Filter out technical pagination params - only show meaningful filters
        const meaningfulQuery = queryEntries.filter(([key]) => 
          !['page', 'limit', 'skip'].includes(key)
        );
        
        // Only show pagination if there are other meaningful fields, or if it's the only info
        if (meaningfulQuery.length > 0) {
          meaningfulQuery.forEach(([key, value]) => {
            const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
            readableDetails.push({
              label: label,
              value: String(value)
            });
          });
        } else if (queryEntries.length > 0 && readableDetails.length === 0) {
          // Only pagination info and no other details - don't show anything meaningful
          // This will result in "No additional information available" message
        }
      }
      
      // Extract from body (request body data)
      if (details['body'] && typeof details['body'] === 'object') {
        // Show meaningful fields from body
        Object.entries(details['body']).forEach(([key, value]) => {
          // Skip technical fields
          if (['_id', '__v', 'createdAt', 'updatedAt'].includes(key)) return;
          
          const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
          let displayValue = value;
          
          if (typeof value === 'object' && value !== null) {
            // For objects, show a summary
            if (Array.isArray(value)) {
              displayValue = `${value.length} item(s)`;
            } else {
              displayValue = Object.keys(value).length > 0 
                ? `${Object.keys(value).length} field(s) updated`
                : 'No changes';
            }
          }
          
          readableDetails.push({
            label: label,
            value: String(displayValue)
          });
        });
      }
    }
    
    return readableDetails;
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '' && v !== undefined);

  if (loading && (!logs || logs.length === 0)) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-600 mt-1">
            Monitor all admin actions and system events
          </p>
        </div>
        <LoadingCard 
          title="Loading Activity Logs"
          message="Fetching recent admin activities and system events..."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-600 mt-1">
            Monitor all admin actions and system events
          </p>
        </div>
        <ErrorDisplay 
          error={createUserFriendlyError(error, 'Activity Logs Loading')}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-600 mt-1">
            Monitor all admin actions and system events
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <FunnelIcon className="w-4 h-4" />
            <span>Filters</span>
            {showAdvancedFilters ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
          </button>
          <div className="relative">
            <button
              onClick={() => handleExport('csv')}
              disabled={exporting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            {exporting && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-600 rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          <button
            onClick={() => handleExport('json')}
            disabled={exporting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 flex items-center space-x-1"
              >
                <XMarkIcon className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search logs..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Action */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <input
                type="text"
                value={filters.action || ''}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                placeholder="e.g., CREATE_PRODUCT"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder:text-gray-400"
              />
            </div>

            {/* Resource Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
              <select
                value={filters.resourceType || ''}
                onChange={(e) => setFilters({ ...filters, resourceType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="product">Product</option>
                <option value="order">Order</option>
                <option value="user">User</option>
                <option value="category">Category</option>
                <option value="settings">Settings</option>
                <option value="analytics">Analytics</option>
              </select>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                value={filters.severity || ''}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value as any || undefined })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">All Severities</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* User Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User Email</label>
              <input
                type="text"
                value={filters.userEmail || ''}
                onChange={(e) => setFilters({ ...filters, userEmail: e.target.value })}
                placeholder="user@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder:text-gray-400"
              />
            </div>

            {/* IP Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
              <input
                type="text"
                value={filters.ip || ''}
                onChange={(e) => setFilters({ ...filters, ip: e.target.value })}
                placeholder="192.168.1.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder:text-gray-400"
              />
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700"
              />
            </div>
          </div>
        </div>
      )}

      {/* Stats Dashboard */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900">{total.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Admins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.byUser?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {logs.filter(log => {
                    const logDate = new Date(log.timestamp);
                    const today = new Date();
                    return logDate.toDateString() === today.toDateString();
                  }).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <ComputerDesktopIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Unique IPs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(logs.map(log => log.ip).filter(Boolean)).size}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logs List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {logs.length === 0 ? (
          <EmptyLogsState />
        ) : (
          <>
            <div className="divide-y divide-gray-200">
              {logs.map((log) => (
                <div 
                  key={log._id} 
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    {/* Severity Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getSeverityColor(log.severity).split(' ')[0]}`}>
                      {getSeverityIcon(log.severity)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-2 mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                              {formatAction(log.action)}
                            </span>
                            {log.severity && (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(log.severity)}`}>
                                {log.severity.toUpperCase()}
                              </span>
                            )}
                            {log.resourceType && (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getResourceTypeColor(log.resourceType)}`}>
                                {log.resourceType}
                              </span>
                            )}
                            <span className="text-sm text-gray-900 font-medium">
                              {log.userName || log.userEmail}
                            </span>
                            {log.statusCode && (
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                log.statusCode >= 500 ? 'bg-red-100 text-red-800' :
                                log.statusCode >= 400 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {log.statusCode}
                              </span>
                            )}
                            {log.duration && (
                              <span className="text-xs text-gray-500">
                                {log.duration}ms
                              </span>
                            )}
                          </div>

                          {log.resourceId && (
                            <div className="text-xs text-gray-500 mb-1">
                              Resource ID: <code className="bg-gray-100 px-1 rounded">{log.resourceId}</code>
                            </div>
                          )}

                          {(log.details || log.changes || log.error) && (
                            <button
                              onClick={() => setExpandedLog(expandedLog === log._id ? null : log._id)}
                              className="mt-2 inline-flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:text-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                            >
                              <span>{expandedLog === log._id ? 'Hide' : 'Show'} Details</span>
                              {expandedLog === log._id ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                            </button>
                          )}

                          {expandedLog === log._id && (
                            <div className="mt-3 space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                              {log.error && (
                                <div>
                                  <p className="text-xs font-medium text-red-600 mb-1">Error:</p>
                                  <p className="text-xs text-red-700 bg-red-50 p-2 rounded">{log.error}</p>
                                </div>
                              )}
                              {log.changes && (
                                <div>
                                  <p className="text-xs font-medium text-gray-700 mb-1">Changes:</p>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    {log.changes.before && (
                                      <div>
                                        <p className="font-medium text-gray-600 mb-1">Before:</p>
                                        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                                          {JSON.stringify(log.changes.before, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                    {log.changes.after && (
                                      <div>
                                        <p className="font-medium text-gray-600 mb-1">After:</p>
                                        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                                          {JSON.stringify(log.changes.after, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              {log.details && Object.keys(log.details).length > 0 && (
                                <div>
                                  <p className="text-sm font-semibold text-gray-700 mb-2">Action Information</p>
                                  <div className="space-y-2">
                                    {formatDetailsForAdmin(log).map((item, index) => (
                                      <div key={index} className="flex items-start justify-between py-1.5 px-2 bg-white rounded border border-gray-200">
                                        <span className="text-xs font-medium text-gray-600">{item.label}:</span>
                                        <span className="text-xs text-gray-900 ml-2 text-right flex-1">{item.value}</span>
                                      </div>
                                    ))}
                                    {formatDetailsForAdmin(log).length === 0 && (
                                      <div className="text-xs text-gray-500 italic py-2">
                                        No additional information available
                                      </div>
                                    )}
                                  </div>
                                  {process.env.NODE_ENV === 'development' && (
                                    <details className="mt-3">
                                      <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                                        Show technical details (dev only)
                                      </summary>
                                      <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                                        {JSON.stringify(log.details, null, 2)}
                                      </pre>
                                    </details>
                                  )}
                                </div>
                              )}
                              {log.requestPath && (
                                <div className="text-xs">
                                  <span className="font-medium text-gray-600">Endpoint: </span>
                                  <code className="bg-gray-100 px-1 rounded">{log.requestMethod} {log.requestPath}</code>
                                </div>
                              )}
                              {log.userAgent && (
                                <div className="text-xs text-gray-500 truncate">
                                  <span className="font-medium">User Agent: </span>
                                  {log.userAgent}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                            {log.ip && (
                              <div className="flex items-center space-x-1">
                                <ComputerDesktopIcon className="w-3 h-3" />
                                <span>{log.ip}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Timestamp */}
                        <div className="flex-shrink-0 ml-4 text-right">
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <ClockIcon className="w-4 h-4" />
                            <span>{formatDate(log.timestamp)}</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="text-sm text-gray-700">
                  Page {page} of {totalPages} ({total.toLocaleString()} total)
                </span>
                
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
