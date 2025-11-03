"use client";

import * as React from 'react';
import { Button } from '../ui/button';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  orderNumber: string;
  isLoading?: boolean;
}

export default function CancelOrderModal({
  isOpen,
  onClose,
  onConfirm,
  orderNumber,
  isLoading = false
}: CancelOrderModalProps) {
  const [reason, setReason] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setReason('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await onConfirm(reason.trim());
      // Modal will be closed by parent component after successful cancellation
    } catch (err: any) {
      setError(err.message || 'Failed to cancel order. Please try again.');
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason('');
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Cancel Order
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Order #{orderNumber}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <p className="text-sm text-gray-700 mb-4">
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>
              
              {/* Important Information */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-semibold text-amber-900 mb-2">
                  Important Information
                </h4>
                <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                  <li>Inventory will be restored for all items</li>
                  <li>If payment was made, refund will be processed</li>
                  <li>You will receive a confirmation email</li>
                </ul>
              </div>

              {/* Reason Input */}
              <div>
                <label htmlFor="cancellation-reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Cancellation Reason (Optional)
                </label>
                <textarea
                  id="cancellation-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={isLoading}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50 disabled:cursor-not-allowed text-sm"
                  placeholder="Please let us know why you're cancelling this order (optional)..."
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {reason.length}/500 characters
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={isLoading}
              >
                Keep Order
              </Button>
              <Button
                type="submit"
                variant="danger"
                disabled={isLoading}
                loading={isLoading}
              >
                {isLoading ? 'Cancelling...' : 'Cancel Order'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

