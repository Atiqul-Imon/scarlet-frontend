"use client";
import * as React from 'react';
import { useCart } from '../../../lib/context';

export default function DebugCartPage() {
  const [cartData, setCartData] = React.useState<string>('');
  const { cart, itemCount, resetCart } = useCart();
  
  React.useEffect(() => {
    // Get current cart data from localStorage
    const stored = localStorage.getItem('scarlet_guest_cart');
    setCartData(stored || 'No cart data found');
    
    // Also log to console for immediate debugging
    console.log('=== CART DEBUG ===');
    console.log('localStorage cart:', stored);
    console.log('Context cart:', cart);
    console.log('Context itemCount:', itemCount);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('Parsed localStorage cart:', parsed);
        console.log('Item count from localStorage:', parsed.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0);
      } catch (error) {
        console.error('Error parsing localStorage cart:', error);
      }
    }
  }, [cart, itemCount]);

  const clearCart = () => {
    resetCart();
    setCartData('Cart cleared');
    // Update display after a short delay
    setTimeout(() => {
      const stored = localStorage.getItem('scarlet_guest_cart');
      setCartData(stored || 'No cart data found');
    }, 100);
  };

  const createTestCart = () => {
    if (!confirm('This will create a test cart with 4 items. Are you sure?')) {
      return;
    }
    
    const testCart = {
      id: 'guest',
      userId: 'guest',
      items: [
        { productId: 'test1', quantity: 2 },
        { productId: 'test2', quantity: 1 },
        { productId: 'test3', quantity: 1 }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('scarlet_guest_cart', JSON.stringify(testCart));
    setCartData(JSON.stringify(testCart, null, 2));
    
    // Update display immediately
    setTimeout(() => {
      const stored = localStorage.getItem('scarlet_guest_cart');
      setCartData(stored || 'No cart data found');
    }, 100);
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Cart Debug Tool
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Current Cart Data</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-medium mb-2">Context Cart (itemCount: {itemCount})</h3>
              <pre className="bg-blue-50 p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(cart, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="font-medium mb-2">LocalStorage Cart</h3>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                {cartData}
              </pre>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={clearCart}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Clear Cart
          </button>
          
          <button
            onClick={createTestCart}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Create Test Cart (4 items)
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            Reload Page
          </button>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-medium text-yellow-800 mb-2">Debug Steps:</h3>
          <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
            <li>Check the current cart data above</li>
            <li>If there are unwanted items, click "Clear Cart"</li>
            <li>Check browser console for cart loading logs</li>
            <li>Test adding products to see if count increases correctly</li>
          </ol>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-medium text-blue-800 mb-2">Manual Clear (Browser Console):</h3>
          <p className="text-sm text-blue-700 mb-2">Copy and paste this command in browser console:</p>
          <code className="block bg-blue-100 p-2 rounded text-xs font-mono text-blue-900">
            localStorage.removeItem('scarlet_guest_cart'); window.location.reload();
          </code>
        </div>
      </div>
    </div>
  );
}
