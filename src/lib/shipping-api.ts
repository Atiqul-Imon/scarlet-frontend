import { fetchJsonAuth } from './api';

export type CourierService = 'pathao' | 'redx' | 'steadfast';

export type ShipmentStatus =
  | 'pending'
  | 'requested'
  | 'pickup_pending'
  | 'pickup_completed'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'returned'
  | 'cancelled'
  | 'failed';

export interface ShipmentItem {
  productId: string;
  title: string;
  quantity: number;
  price: number;
}

export interface ShipmentAddress {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  area: string;
  postalCode: string;
}

export interface ShipmentTracking {
  status: ShipmentStatus;
  message: string;
  timestamp: string;
  location?: string;
}

export interface Shipment {
  _id: string;
  orderId: string;
  orderNumber: string;
  courier: CourierService;
  courierOrderId?: string;
  trackingNumber?: string;
  status: ShipmentStatus;
  senderInfo: {
    name: string;
    phone: string;
    address: string;
    city: string;
    area: string;
  };
  recipientInfo: ShipmentAddress;
  items: ShipmentItem[];
  itemType: string;
  itemQuantity: number;
  itemWeight?: number;
  itemValue: number;
  deliveryFee: number;
  codAmount?: number;
  isCOD: boolean;
  trackingHistory: ShipmentTracking[];
  estimatedDelivery?: string;
  actualDeliveryDate?: string;
  specialInstructions?: string;
  deliveryType?: 'normal' | 'express';
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateShipmentRequest {
  orderId: string;
  courier: CourierService;
  recipientName: string;
  recipientPhone: string;
  recipientEmail?: string;
  recipientAddress: string;
  recipientCity: string;
  recipientArea: string;
  recipientPostalCode: string;
  itemType: string;
  itemQuantity: number;
  itemWeight?: number;
  itemValue: number;
  deliveryFee: number;
  codAmount?: number;
  isCOD: boolean;
  specialInstructions?: string;
  deliveryType?: 'normal' | 'express';
}

export interface CourierRate {
  courier: CourierService;
  deliveryFee: number;
  codCharge?: number;
  totalCharge: number;
  estimatedDays?: number;
  available: boolean;
}

export interface ShipmentsListResponse {
  shipments: Shipment[];
  total: number;
  pages: number;
}

export interface ShipmentStats {
  total: number;
  byStatus: Record<ShipmentStatus, number>;
  byCourier: Record<string, number>;
}

/**
 * Get delivery rates from all couriers
 */
export async function getDeliveryRates(params: {
  city: string;
  area: string;
  weight?: number;
  codAmount?: number;
  deliveryType?: 'normal' | 'express';
}): Promise<CourierRate[]> {
  return fetchJsonAuth<CourierRate[]>('/shipping/rates', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

/**
 * Create a new shipment
 */
export async function createShipment(
  request: CreateShipmentRequest
): Promise<Shipment> {
  return fetchJsonAuth<Shipment>('/shipping', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Track shipment by tracking number (public)
 */
export async function trackShipment(trackingNumber: string): Promise<Shipment> {
  return fetchJsonAuth<Shipment>(`/shipping/track/${trackingNumber}`);
}

/**
 * Get shipment by ID (admin)
 */
export async function getShipmentById(id: string): Promise<Shipment> {
  return fetchJsonAuth<Shipment>(`/shipping/${id}`);
}

/**
 * Get shipments for an order
 */
export async function getOrderShipments(orderId: string): Promise<Shipment[]> {
  return fetchJsonAuth<Shipment[]>(`/shipping/order/${orderId}`);
}

/**
 * List all shipments with filters (admin)
 */
export async function listShipments(params?: {
  status?: ShipmentStatus;
  courier?: CourierService;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<ShipmentsListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.courier) queryParams.append('courier', params.courier);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  const queryString = queryParams.toString();
  const url = queryString ? `/shipping?${queryString}` : '/shipping';
  
  return fetchJsonAuth<ShipmentsListResponse>(url);
}

/**
 * Update shipment status (admin)
 */
export async function updateShipmentStatus(
  id: string,
  status: ShipmentStatus,
  message?: string
): Promise<Shipment> {
  return fetchJsonAuth<Shipment>(`/shipping/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, message }),
  });
}

/**
 * Cancel shipment (admin)
 */
export async function cancelShipment(id: string): Promise<{ cancelled: boolean }> {
  return fetchJsonAuth<{ cancelled: boolean }>(`/shipping/${id}/cancel`, {
    method: 'POST',
  });
}

/**
 * Get shipment statistics (admin)
 */
export async function getShipmentStats(params?: {
  startDate?: string;
  endDate?: string;
  courier?: CourierService;
}): Promise<ShipmentStats> {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.courier) queryParams.append('courier', params.courier);
  
  const queryString = queryParams.toString();
  const url = queryString ? `/shipping/stats?${queryString}` : '/shipping/stats';
  
  return fetchJsonAuth<ShipmentStats>(url);
}

/**
 * Sync all active shipment statuses (admin)
 */
export async function syncShipmentStatuses(): Promise<void> {
  await fetchJsonAuth('/shipping/sync-statuses', { method: 'POST' });
}

/**
 * Check courier availability
 */
export async function checkCourierAvailability(params: {
  courier: CourierService;
  city: string;
  area: string;
}): Promise<{ available: boolean }> {
  return fetchJsonAuth<{ available: boolean }>('/shipping/availability', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

/**
 * Get courier badge color
 */
export function getCourierBadgeColor(courier: CourierService): string {
  const colors: Record<CourierService, string> = {
    pathao: 'bg-red-100 text-red-800',
    redx: 'bg-blue-100 text-blue-800',
    steadfast: 'bg-green-100 text-green-800',
  };
  return colors[courier] || 'bg-gray-100 text-gray-800';
}

/**
 * Get status badge color
 */
export function getStatusBadgeColor(status: ShipmentStatus): string {
  const colors: Record<ShipmentStatus, string> = {
    pending: 'bg-gray-100 text-gray-800',
    requested: 'bg-blue-100 text-blue-800',
    pickup_pending: 'bg-yellow-100 text-yellow-800',
    pickup_completed: 'bg-indigo-100 text-indigo-800',
    in_transit: 'bg-purple-100 text-purple-800',
    out_for_delivery: 'bg-orange-100 text-orange-800',
    delivered: 'bg-green-100 text-green-800',
    returned: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
    failed: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Format status label
 */
export function formatStatusLabel(status: ShipmentStatus): string {
  const labels: Record<ShipmentStatus, string> = {
    pending: 'Pending',
    requested: 'Requested',
    pickup_pending: 'Pickup Pending',
    pickup_completed: 'Picked Up',
    in_transit: 'In Transit',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    returned: 'Returned',
    cancelled: 'Cancelled',
    failed: 'Failed',
  };
  return labels[status] || status;
}

/**
 * Format courier name
 */
export function formatCourierName(courier: CourierService): string {
  const names: Record<CourierService, string> = {
    pathao: 'Pathao',
    redx: 'RedX',
    steadfast: 'Steadfast',
  };
  return names[courier] || courier;
}

