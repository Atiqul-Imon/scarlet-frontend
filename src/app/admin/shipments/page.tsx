'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  listShipments,
  getShipmentStats,
  syncShipmentStatuses,
  type Shipment,
  type ShipmentStatus,
  type CourierService,
  type ShipmentStats,
  getCourierBadgeColor,
  getStatusBadgeColor,
  formatStatusLabel,
  formatCourierName,
} from '@/lib/shipping-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ShipmentsManagementPage() {
  const router = useRouter();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [stats, setStats] = useState<ShipmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | ''>('');
  const [courierFilter, setCourierFilter] = useState<CourierService | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Load shipments
  const loadShipments = async () => {
    try {
      setLoading(true);
      const response = await listShipments({
        status: statusFilter || undefined,
        courier: courierFilter || undefined,
        page: currentPage,
        limit: 20,
      });
      setShipments(response.shipments);
      setTotalPages(response.pages);
    } catch (error) {
      console.error('Failed to load shipments:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Load statistics
  const loadStats = async () => {
    try {
      const statsData = await getShipmentStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };
  
  // Sync statuses
  const handleSync = async () => {
    try {
      setSyncing(true);
      await syncShipmentStatuses();
      alert('Sync initiated. Shipment statuses will be updated in the background.');
      setTimeout(() => loadShipments(), 2000);
    } catch (error) {
      console.error('Failed to sync:', error);
      alert('Failed to sync shipments');
    } finally {
      setSyncing(false);
    }
  };
  
  useEffect(() => {
    loadShipments();
    loadStats();
  }, [statusFilter, courierFilter, currentPage]);
  
  // Filter shipments by search query
  const filteredShipments = shipments.filter(
    (shipment) =>
      shipment.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.recipientInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.recipientInfo.phone.includes(searchQuery)
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Shipment Management</h1>
        <div className="flex gap-2">
          <Button
            onClick={handleSync}
            disabled={syncing}
            variant="outline"
          >
            {syncing ? 'Syncing...' : 'Sync All Statuses'}
          </Button>
          <Button onClick={() => router.push('/admin/shipments/create')}>
            Create Shipment
          </Button>
        </div>
      </div>
      
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Shipments</h3>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">In Transit</h3>
            <p className="text-2xl font-bold mt-1 text-purple-600">
              {(stats.byStatus.in_transit || 0) + (stats.byStatus.pickup_completed || 0)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Delivered</h3>
            <p className="text-2xl font-bold mt-1 text-green-600">
              {stats.byStatus.delivered || 0}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Pending</h3>
            <p className="text-2xl font-bold mt-1 text-yellow-600">
              {(stats.byStatus.pending || 0) + (stats.byStatus.requested || 0)}
            </p>
          </div>
        </div>
      )}
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            type="text"
            placeholder="Search orders, tracking, name, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border rounded-md px-3 py-2"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="requested">Requested</option>
            <option value="pickup_pending">Pickup Pending</option>
            <option value="pickup_completed">Picked Up</option>
            <option value="in_transit">In Transit</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="returned">Returned</option>
            <option value="cancelled">Cancelled</option>
            <option value="failed">Failed</option>
          </select>
          
          <select
            value={courierFilter}
            onChange={(e) => setCourierFilter(e.target.value as any)}
            className="border rounded-md px-3 py-2"
          >
            <option value="">All Couriers</option>
            <option value="pathao">Pathao</option>
            <option value="redx">RedX</option>
            <option value="steadfast">Steadfast</option>
          </select>
          
          <Button
            onClick={() => {
              setStatusFilter('');
              setCourierFilter('');
              setSearchQuery('');
              setCurrentPage(1);
            }}
            variant="outline"
          >
            Clear Filters
          </Button>
        </div>
      </div>
      
      {/* Shipments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Loading shipments...</p>
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No shipments found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tracking
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Courier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      COD
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredShipments.map((shipment) => (
                    <tr key={shipment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {shipment.orderNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {shipment.trackingNumber || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getCourierBadgeColor(
                            shipment.courier
                          )}`}
                        >
                          {formatCourierName(shipment.courier)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {shipment.recipientInfo.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {shipment.recipientInfo.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(
                            shipment.status
                          )}`}
                        >
                          {formatStatusLabel(shipment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {shipment.isCOD ? (
                          <div className="text-sm">
                            <div className="font-medium text-green-600">
                              ৳{shipment.codAmount?.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">COD</div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">Prepaid</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(shipment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button
                          onClick={() =>
                            router.push(`/admin/shipments/${shipment._id}`)
                          }
                          variant="outline"
                          size="sm"
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

