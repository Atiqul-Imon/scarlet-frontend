"use client";
import React, { useState, useEffect } from 'react';
import { useCart, useAuth } from '@/lib/context';
import { cartApi } from '@/lib/api';

interface MobileCartDebugProps {
  productId?: string;
  className?: string;
}

export default function MobileCartDebug({ productId = 'test-product-1', className = '' }: MobileCartDebugProps) {
  const { cart, addItem, itemCount, loading, error } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isAdding, setIsAdding] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  // Detect mobile device
  const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  useEffect(() => {
    const gatherDebugInfo = () => {
      const info = {
        isMobile,
        userAgent: navigator.userAgent,
        isAuthenticated,
        userId: user?._id,
        cartState: cart,
        itemCount,
        loading,
        error: error?.message,
        localStorage: {
          guestCart: localStorage.getItem('scarlet_guest_cart'),
          sessionId: localStorage.getItem('scarlet_session_id'),
          accessToken: localStorage.getItem('accessToken'),
          refreshToken: localStorage.getItem('refreshToken'),
        },
        screenSize: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        connection: (navigator as any).connection ? {
          effectiveType: (navigator as any).connection.effectiveType,
          downlink: (navigator as any).connection.downlink,
        } : null,
        timestamp: new Date().toISOString(),
      };
      setDebugInfo(info);
    };

    gatherDebugInfo();
  }, [cart, isAuthenticated, user, itemCount, loading, error, isMobile]);

  const testAddToCart = async () => {
    setIsAdding(true);
    const results: string[] = [];
    
    try {
      results.push(`🔄 Testing add to cart for product: ${productId}`);
      results.push(`📱 Mobile device: ${isMobile}`);
      results.push(`🔐 Authenticated: ${isAuthenticated}`);
      
      // Test API connectivity
      try {
        const testResponse = await fetch('/api/health', { method: 'GET' });
        results.push(`🌐 API connectivity: ${testResponse.ok ? 'OK' : 'FAILED'}`);
      } catch (apiError) {
        results.push(`🌐 API connectivity: FAILED - ${apiError}`);
      }
      
      // Test cart API
      try {
        if (isAuthenticated) {
          const cartResponse = await cartApi.getCart();
          results.push(`🛒 Cart API (auth): OK - ${cartResponse.items?.length || 0} items`);
        } else {
          const sessionId = localStorage.getItem('scarlet_session_id') || 'test-session';
          const guestCartResponse = await cartApi.getGuestCart(sessionId);
          results.push(`🛒 Cart API (guest): OK - ${guestCartResponse.items?.length || 0} items`);
        }
      } catch (cartError) {
        results.push(`🛒 Cart API: FAILED - ${cartError}`);
      }
      
      // Test add item
      try {
        await addItem(productId, 1);
        results.push(`✅ Add item: SUCCESS`);
      } catch (addError) {
        results.push(`❌ Add item: FAILED - ${addError}`);
      }
      
    } catch (error) {
      results.push(`💥 Test failed: ${error}`);
    } finally {
      setIsAdding(false);
      setTestResults(results);
    }
  };

  const clearCart = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem('scarlet_guest_cart');
      localStorage.removeItem('scarlet_session_id');
      
      // Reload page to reset cart context
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50 ${className}`}>
      <h3 className="font-bold text-sm mb-2">Mobile Cart Debug</h3>
      
      <div className="space-y-2 text-xs">
        <div><strong>Mobile:</strong> {isMobile ? 'Yes' : 'No'}</div>
        <div><strong>Auth:</strong> {isAuthenticated ? 'Yes' : 'No'}</div>
        <div><strong>Items:</strong> {itemCount}</div>
        <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
        {error && <div><strong>Error:</strong> {error}</div>}
      </div>
      
      <div className="mt-3 space-y-2">
        <button
          onClick={testAddToCart}
          disabled={isAdding}
          className="w-full px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isAdding ? 'Testing...' : 'Test Add to Cart'}
        </button>
        
        <button
          onClick={clearCart}
          className="w-full px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
        >
          Clear Cart & Reload
        </button>
      </div>
      
      {testResults.length > 0 && (
        <div className="mt-3 p-2 bg-gray-100 rounded text-xs max-h-32 overflow-y-auto">
          {testResults.map((result, index) => (
            <div key={index} className="mb-1">{result}</div>
          ))}
        </div>
      )}
      
      <details className="mt-2">
        <summary className="text-xs cursor-pointer">Debug Info</summary>
        <pre className="text-xs mt-1 overflow-auto max-h-32 bg-gray-50 p-2 rounded">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </details>
    </div>
  );
}
