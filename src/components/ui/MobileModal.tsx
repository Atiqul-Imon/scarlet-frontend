"use client";
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import TouchButton from './TouchButton';

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  overlayClassName?: string;
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  full: 'max-w-full mx-0 rounded-none',
};

export default function MobileModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className,
  overlayClassName,
}: MobileModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else if (previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose();
    }
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-end sm:items-center justify-center',
        overlayClassName
      )}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          'relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full',
          sizes[size],
          'animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0',
          'duration-300 ease-out',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {title && (
              <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
            )}
            
            {showCloseButton && (
              <TouchButton
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="ml-auto"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </TouchButton>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

// Specialized modal for product quick view
export function ProductQuickViewModal({
  isOpen,
  onClose,
  product,
  onAddToCart,
  onAddToWishlist,
}: {
  isOpen: boolean;
  onClose: () => void;
  product: {
    _id: string;
    title: string;
    images: string[];
    price: { amount: number; currency: string };
    description?: string;
  };
  onAddToCart: () => void;
  onAddToWishlist: () => void;
}) {
  return (
    <MobileModal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick View"
      size="lg"
    >
      <div className="space-y-4">
        {/* Product Image */}
        {product.images[0] && (
          <div className="aspect-square rounded-lg overflow-hidden">
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Product Info */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {product.title}
          </h3>
          
          <div className="text-2xl font-bold text-red-700 mb-4">
            {product.price.currency} {product.price.amount}
          </div>

          {product.description && (
            <p className="text-gray-600 mb-4 line-clamp-3">
              {product.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <TouchButton
            variant="primary"
            className="flex-1"
            onClick={onAddToCart}
          >
            Add to Cart
          </TouchButton>
          
          <TouchButton
            variant="outline"
            onClick={onAddToWishlist}
          >
            🤍
          </TouchButton>
        </div>
      </div>
    </MobileModal>
  );
}

// Specialized modal for filters
export function FilterModal({
  isOpen,
  onClose,
  children,
  onApply,
  onClear,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  onApply: () => void;
  onClear: () => void;
}) {
  return (
    <MobileModal
      isOpen={isOpen}
      onClose={onClose}
      title="Filters"
      size="full"
      className="h-[80vh]"
    >
      <div className="flex flex-col h-full">
        {/* Filter Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Actions */}
        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <TouchButton
            variant="outline"
            className="flex-1"
            onClick={onClear}
          >
            Clear All
          </TouchButton>
          
          <TouchButton
            variant="primary"
            className="flex-1"
            onClick={() => {
              onApply();
              onClose();
            }}
          >
            Apply Filters
          </TouchButton>
        </div>
      </div>
    </MobileModal>
  );
}
