// This script can be run in the browser console to clear cart data
console.log('=== CART DEBUG SCRIPT ===');

// Check current cart data
const currentCart = localStorage.getItem('scarlet_guest_cart');
console.log('Current cart localStorage:', currentCart);

if (currentCart) {
  try {
    const parsed = JSON.parse(currentCart);
    console.log('Parsed cart data:', parsed);
    console.log('Item count:', parsed.items ? parsed.items.reduce((total, item) => total + item.quantity, 0) : 0);
  } catch (error) {
    console.error('Error parsing cart data:', error);
  }
}

// Clear all cart-related localStorage
console.log('Clearing cart data...');
localStorage.removeItem('scarlet_guest_cart');

// Check if it's cleared
const afterClear = localStorage.getItem('scarlet_guest_cart');
console.log('After clearing:', afterClear);

// Also check for any other possible cart keys
const allKeys = Object.keys(localStorage);
console.log('All localStorage keys:', allKeys);

const cartRelatedKeys = allKeys.filter(key => 
  key.toLowerCase().includes('cart') || 
  key.toLowerCase().includes('scarlet')
);
console.log('Cart-related keys:', cartRelatedKeys);

// Clear any cart-related keys
cartRelatedKeys.forEach(key => {
  console.log(`Clearing key: ${key}`);
  localStorage.removeItem(key);
});

console.log('=== CART CLEARED ===');
console.log('Please refresh the page to see the updated cart count.');
