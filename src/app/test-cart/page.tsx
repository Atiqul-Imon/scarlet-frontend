"use client";
import * as React from 'react';
import { useCart } from '../../lib/context';

export default function TestCartPage() {
  const { cart, addItem } = useCart();

  const handleAddTestItem = async () => {
    try {
      console.log('Adding test item...');
      await addItem('test-product-123', 2);
      console.log('Test item added successfully');
    } catch (error) {
      console.error('Failed to add test item:', error);
    }
  };

  const handleAddDirectToLocalStorage = () => {
    const testCart = {
      id: 'guest',
      userId: 'guest',
      items: [
        { productId: 'test-product-1', quantity: 1 },
        { productId: 'test-product-2', quantity: 2 }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('scarlet_guest_cart', JSON.stringify(testCart));
    console.log('Cart added to localStorage:', testCart);
    window.location.reload();
  };

  const handleClearCart = () => {
    localStorage.removeItem('scarlet_guest_cart');
    console.log('Cart cleared from localStorage');
    window.location.reload();
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Cart Test Page</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Current Cart State</h2>
        <div className="space-y-2">
          <p><strong>Cart exists:</strong> {cart ? 'Yes' : 'No'}</p>
          <p><strong>Cart items:</strong> {cart?.items?.length || 0}</p>
          <p><strong>LocalStorage cart:</strong> {localStorage.getItem('scarlet_guest_cart') ? 'Yes' : 'No'}</p>
        </div>
        
        <div className="mt-4">
          <h3 className="font-bold mb-2">Raw Cart Data:</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(cart, null, 2)}
          </pre>
        </div>
        
        <div className="mt-4">
          <h3 className="font-bold mb-2">LocalStorage Data:</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {localStorage.getItem('scarlet_guest_cart') || 'null'}
          </pre>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Test Actions</h2>
        <div className="space-y-4">
          <button
            onClick={handleAddTestItem}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Add Test Item (via context)
          </button>
          
          <button
            onClick={handleAddDirectToLocalStorage}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 ml-4"
          >
            Add Items Directly to localStorage
          </button>
          
          <button
            onClick={handleClearCart}
            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 ml-4"
          >
            Clear Cart
          </button>
        </div>
      </div>

      <div className="mt-8">
        <a href="/cart" className="bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600">
          Go to Cart Page
        </a>
      </div>
    </div>
  );
}
