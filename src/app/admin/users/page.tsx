'use client';

import { useState, useEffect } from 'react';
import { 
  UserGroupIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  CheckBadgeIcon,
  XMarkIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { AdminDataTable, type Column } from '@/components/admin/AdminDataTable';
import { adminApi } from '@/lib/api';
import type { AdminUser, AdminUserFilters, AdminPaginatedResponse } from '@/lib/admin-types';
import { useToast } from '@/lib/context';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState<AdminUserFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { addToast } = useToast();

  const itemsPerPage = 20;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.users.getUsers({
        ...filters,
        page: currentPage,
        limit: itemsPerPage
      });
      
      setUsers(response.users || []);
      setTotalPages(response.totalPages || 1);
      setTotalItems(response.total || 0);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load users'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filters]);

  const handleSearch = (query: string) => {
    setFilters({ ...filters, search: query });
    setCurrentPage(1);
  };

  const handleViewUser = (user: AdminUser) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleEditRole = (user: AdminUser) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  const handleDeleteUser = (user: AdminUser) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleRoleUpdate = async (userId: string, newRole: 'admin' | 'staff' | 'customer') => {
    try {
      setActionLoading(true);
      await adminApi.users.updateUserRole(userId, newRole);
      addToast({
        type: 'success',
        title: 'Success',
        message: `User role updated to ${newRole}`
      });
      setShowRoleModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user role:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update user role'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      await adminApi.users.deleteUser(selectedUser._id);
      addToast({
        type: 'success',
        title: 'Success',
        message: 'User deleted successfully'
      });
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete user'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: 'bg-gradient-to-r from-purple-500 to-violet-500 text-white',
      staff: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
      customer: 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badges[role as keyof typeof badges] || badges.customer}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const getVerificationStatus = (isEmailVerified?: boolean, isPhoneVerified?: boolean) => {
    return (
      <div className="flex items-center space-x-2">
        {isEmailVerified ? (
          <CheckBadgeIcon className="w-4 h-4 text-green-500" title="Email Verified" />
        ) : (
          <XMarkIcon className="w-4 h-4 text-red-500" title="Email Not Verified" />
        )}
        {isPhoneVerified ? (
          <CheckBadgeIcon className="w-4 h-4 text-green-500" title="Phone Verified" />
        ) : (
          <XMarkIcon className="w-4 h-4 text-red-500" title="Phone Not Verified" />
        )}
      </div>
    );
  };

  const columns: Column<AdminUser>[] = [
    {
      key: 'firstName',
      header: 'Name',
      sortable: true,
      render: (_, user) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {user.firstName?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-sm text-gray-500">
              ID: {user._id}
            </div>
          </div>
        </div>
      ),
      width: 'w-64'
    },
    {
      key: 'email',
      header: 'Contact',
      render: (_, user) => (
        <div className="space-y-1">
          {user.email && (
            <div className="flex items-center space-x-2 text-sm">
              <EnvelopeIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900">{user.email}</span>
            </div>
          )}
          {user.phone && (
            <div className="flex items-center space-x-2 text-sm">
              <PhoneIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900">{user.phone}</span>
            </div>
          )}
        </div>
      ),
      width: 'w-64'
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (role) => getRoleBadge(role),
      width: 'w-32'
    },
    {
      key: 'isEmailVerified',
      header: 'Verification',
      render: (_, user) => getVerificationStatus(user.isEmailVerified, user.isPhoneVerified),
      width: 'w-32'
    },
    {
      key: 'createdAt',
      header: 'Joined',
      sortable: true,
      render: (createdAt) => (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <CalendarIcon className="w-4 h-4" />
          <span>{new Date(createdAt).toLocaleDateString()}</span>
        </div>
      ),
      width: 'w-32'
    }
  ];

  const actions = [
    {
      label: 'View',
      icon: EyeIcon,
      onClick: handleViewUser
    },
    {
      label: 'Edit Role',
      icon: ShieldCheckIcon,
      onClick: handleEditRole
    },
    {
      label: 'Delete',
      icon: TrashIcon,
      variant: 'danger' as const,
      onClick: handleDeleteUser
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <UserGroupIcon className="w-8 h-8 text-red-500 mr-3" />
            Customer Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your beauty community with care
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors duration-200"
          >
            Filters
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-700 hover:to-rose-600 transition-all duration-200 shadow-lg">
            Add User
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-6 border border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-700 text-sm font-medium">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{totalItems.toLocaleString()}</p>
            </div>
            <UserGroupIcon className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Verified Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.isEmailVerified || u.isPhoneVerified).length}
              </p>
            </div>
            <CheckBadgeIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Staff Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'staff').length}
              </p>
            </div>
            <ShieldCheckIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Administrators</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
            <ShieldCheckIcon className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Users</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={filters.role || ''}
                onChange={(e) => setFilters({ ...filters, role: e.target.value as any })}
                className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="">All Roles</option>
                <option value="customer">Customer</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Status</label>
              <select
                value={filters.isEmailVerified?.toString() || ''}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  isEmailVerified: e.target.value === '' ? undefined : e.target.value === 'true' 
                })}
                className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="">All</option>
                <option value="true">Verified</option>
                <option value="false">Unverified</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-4 mt-6">
            <button
              onClick={() => {
                setFilters({});
                setCurrentPage(1);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              Clear Filters
            </button>
            <button
              onClick={() => setCurrentPage(1)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <AdminDataTable
        data={users}
        columns={columns}
        loading={loading}
        searchable={true}
        onSearch={handleSearch}
        onRefresh={fetchUsers}
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage,
          onPageChange: setCurrentPage
        }}
        actions={actions}
        emptyMessage="No users found. Start by adding your first customer!"
      />

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {selectedUser.firstName?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h4>
                  <p className="text-sm text-gray-500">ID: {selectedUser._id}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{selectedUser.email}</span>
                </div>
                {selectedUser.phone && (
                  <div className="flex items-center space-x-2">
                    <PhoneIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{selectedUser.phone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    Joined: {new Date(selectedUser.createdAt || '').toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Role:</span>
                {getRoleBadge(selectedUser.role)}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Verification:</span>
                <div className="flex items-center space-x-2">
                  {selectedUser.isEmailVerified ? (
                    <CheckBadgeIcon className="w-4 h-4 text-green-500" title="Email Verified" />
                  ) : (
                    <XMarkIcon className="w-4 h-4 text-red-500" title="Email Not Verified" />
                  )}
                  {selectedUser.isPhoneVerified ? (
                    <CheckBadgeIcon className="w-4 h-4 text-green-500" title="Phone Verified" />
                  ) : (
                    <XMarkIcon className="w-4 h-4 text-red-500" title="Phone Not Verified" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit User Role</h3>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {selectedUser.firstName?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h4>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Role: {getRoleBadge(selectedUser.role)}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['customer', 'staff', 'admin'].map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleUpdate(selectedUser._id, role as 'admin' | 'staff' | 'customer')}
                      disabled={actionLoading || role === selectedUser.role}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        role === selectedUser.role
                          ? 'bg-red-100 text-red-800 border-2 border-red-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                      } ${actionLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-600">Delete User</h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {selectedUser.firstName?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h4>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <TrashIcon className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Warning</h4>
                    <p className="text-sm text-red-700 mt-1">
                      This action cannot be undone. The user will be permanently deleted from the system.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteUser}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
