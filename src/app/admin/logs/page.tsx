'use client';

import { useState, useEffect } from 'react';
import { 
  ClockIcon,
  UserIcon,
  ComputerDesktopIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { adminApi } from '@/lib/api';
import type { AdminActivityLog } from '@/lib/admin-types';
import ErrorDisplay, { createUserFriendlyError } from '../../../components/admin/ErrorDisplay';
import { LoadingCard } from '../../../components/admin/LoadingState';
import EmptyState, { EmptyLogsState } from '../../../components/admin/EmptyState';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.logs.getActivityLogs(page, 50);
      setLogs(data?.data || []);
      setTotalPages(Math.ceil((data?.total || 0) / 50));
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError(err);
      setLogs([]); // Set empty array on error
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (_action: string) => {
    const action = _action.toUpperCase();
    if (action.includes('CREATE') || action.includes('ADD')) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (action.includes('UPDATE') || action.includes('EDIT')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (action.includes('DELETE') || action.includes('REMOVE')) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    if (action.includes('VIEW') || action.includes('READ')) {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
    return 'bg-purple-100 text-purple-800 border-purple-200';
  };

  const getActionIcon = (_action: string) => {
    // Return appropriate icon based on action type
    return '📝';
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
    const diffDays = Math.floor(diffMs / 86400000);

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

  const filteredLogs = (logs || []).filter(log => {
    const matchesSearch = !searchTerm || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip?.includes(searchTerm);
    
    const matchesFilter = actionFilter === 'all' || log.action.includes(actionFilter.toUpperCase());
    
    return matchesSearch && matchesFilter;
  });

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
        <p className="text-gray-600 mt-1">
          Monitor all admin actions and system events
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by action, admin email, or IP address..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="view">View</option>
              <option value="login">Login</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Logs</p>
              <p className="text-2xl font-bold text-gray-900">{logs?.length || 0}</p>
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
                {new Set((logs || []).map(log => log.userId)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {(logs || []).filter(log => {
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
                {new Set((logs || []).map(log => log.ip).filter(Boolean)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredLogs.length === 0 ? (
          searchTerm || actionFilter !== 'all' ? (
            <EmptyState
              icon={DocumentTextIcon}
              title="No Logs Found"
              description="No activity logs match your search criteria. Try adjusting your filters or search terms."
            />
          ) : (
            <EmptyLogsState />
          )
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredLogs.map((log) => (
              <div 
                key={log._id} 
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                    {getActionIcon(log.action)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 flex-wrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                            {formatAction(log.action)}
                          </span>
                          <span className="text-sm text-gray-900 font-medium">
                            {log.userEmail}
                          </span>
                        </div>

                        {log.details && Object.keys(log.details).length > 0 && (
                          <div className="mt-2 text-sm text-gray-600">
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {JSON.stringify(log.details, null, 2)}
                            </code>
                          </div>
                        )}

                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                          {log.ip && (
                            <div className="flex items-center space-x-1">
                              <ComputerDesktopIcon className="w-3 h-3" />
                              <span>{log.ip}</span>
                            </div>
                          )}
                          {log.userAgent && (
                            <div className="flex items-center space-x-1 max-w-md truncate">
                              <span className="truncate">{log.userAgent}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Timestamp */}
                      <div className="flex-shrink-0 ml-4">
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <ClockIcon className="w-4 h-4" />
                          <span>{formatDate(log.timestamp)}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1 text-right">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
              Page {page} of {totalPages}
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
      </div>
    </div>
  );
}

