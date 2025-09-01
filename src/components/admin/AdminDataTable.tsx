'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  EllipsisHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  width?: string;
}

export interface AdminDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
  };
  onSort?: (key: string, direction: 'asc' | 'desc') => void; 
  onSearch?: (query: string) => void;
  onRefresh?: () => void;
  emptyMessage?: string;
  actions?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (row: T) => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }[];
}

export function AdminDataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  searchable = true,
  filterable = false,
  pagination,
  onSort,
  onSearch,
  onRefresh,
  emptyMessage = 'No data available',
  actions = []
}: AdminDataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const handleSort = (key: string) => {
    if (!onSort) return;
    
    const direction = sortConfig?.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    onSort(key, direction);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const toggleRowSelection = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const selectAllRows = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map((_, index) => index)));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {searchable && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-80 pl-10 pr-3 py-2 border border-pink-200 rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            )}
            
            {selectedRows.size > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">
                  {selectedRows.size} selected
                </span>
                <button className="px-3 py-1 bg-pink-500 text-white text-sm rounded-lg hover:bg-pink-600 transition-colors duration-200">
                  Bulk Actions
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {filterable && (
              <button className="p-2 text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors duration-200">
                <FunnelIcon className="w-5 h-5" />
              </button>
            )}
            
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors duration-200"
                disabled={loading}
              >
                <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-pink-100">
          <thead className="bg-gradient-to-r from-pink-50 to-rose-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-pink-600 border-pink-300 rounded focus:ring-pink-500"
                  checked={selectedRows.size === data.length && data.length > 0}
                  onChange={selectAllRows}
                />
              </th>
              {columns.map((column) => (
                <th
                  key={column.key as string}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.width || ''}`}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <button
                        onClick={() => handleSort(column.key as string)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {sortConfig?.key === column.key ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUpIcon className="w-4 h-4" />
                          ) : (
                            <ChevronDownIcon className="w-4 h-4" />
                          )
                        ) : (
                          <ChevronUpIcon className="w-4 h-4 opacity-50" />
                        )}
                      </button>
                    )}
                  </div>
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-pink-50">
            {loading ? (
              [...Array(5)].map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="w-4 h-4 bg-pink-200 rounded"></div>
                  </td>
                  {columns.map((column) => (
                    <td key={column.key as string} className="px-6 py-4">
                      <div className="h-4 bg-pink-200 rounded w-3/4"></div>
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-6 py-4">
                      <div className="h-4 bg-pink-200 rounded w-16 ml-auto"></div>
                    </td>
                  )}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions.length > 0 ? 2 : 1)} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MagnifyingGlassIcon className="w-8 h-8 text-pink-400" />
                    </div>
                    <p className="text-lg font-medium mb-2">No Data Found</p>
                    <p className="text-sm">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={index}
                  className={`hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 transition-all duration-200 ${
                    selectedRows.has(index) ? 'bg-gradient-to-r from-pink-50 to-rose-50' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-pink-600 border-pink-300 rounded focus:ring-pink-500"
                      checked={selectedRows.has(index)}
                      onChange={() => toggleRowSelection(index)}
                    />
                  </td>
                  {columns.map((column) => (
                    <td key={column.key as string} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render
                        ? column.render(row[column.key as keyof T], row, index)
                        : String(row[column.key as keyof T] || '')}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {actions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={() => action.onClick(row)}
                            className={`
                              px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200
                              ${action.variant === 'danger' 
                                ? 'text-red-600 hover:bg-red-50' 
                                : action.variant === 'secondary'
                                ? 'text-gray-600 hover:bg-gray-50'
                                : 'text-pink-600 hover:bg-pink-50'
                              }
                            `}
                          >
                            {action.icon && <action.icon className="w-4 h-4 inline mr-1" />}
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-6 py-3 border-t border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
              {pagination.totalItems} results
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="p-2 text-gray-500 hover:text-pink-600 hover:bg-pink-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => pagination.onPageChange(page)}
                      className={`
                        px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200
                        ${pagination.currentPage === page
                          ? 'bg-pink-500 text-white'
                          : 'text-gray-700 hover:bg-pink-100'
                        }
                      `}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="p-2 text-gray-500 hover:text-pink-600 hover:bg-pink-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
