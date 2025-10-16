"use client";

export const dynamic = 'force-dynamic';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useCart, useToast, useAuth } from '../../lib/context';
import { useForm } from '../../lib/hooks';
import { productApi } from '../../lib/api';

interface CheckoutFormData {
  // Shipping Information
  firstName: string;
  lastName?: string; // Made optional
  email?: string; // Made optional
  phone: string;
  address: string;
  city: string;
  area: string;
  postalCode: string;
  
  // Payment Information
  paymentMethod: 'bkash' | 'nagad' | 'rocket' | 'card' | 'cod' | 'sslcommerz';
  
  // Special Instructions
  notes?: string;
  
  // Terms
  acceptTerms: boolean;
}

interface CartItemData {
  productId: string;
  title: string;
  slug: string;
  image: string;
  price: {
    currency: string;
    amount: number;
  };
  quantity: number;
  brand?: string;
  stock?: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, sessionId } = useCart();
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useToast();

  // Helper function to handle SSLCommerz payment flow
  const handleSSLCommerzPayment = async () => {
    try {
      console.log('Initiating SSLCommerz payment...');
      
      // Import the payment API
      const { paymentApi } = await import('../../lib/api');
      const { orderApi } = await import('../../lib/api');
      
      // First create a pending order
      const orderData = {
        firstName: values.firstName,
        lastName: values.lastName || undefined,
        email: values.email || undefined,
        phone: values.phone,
        address: values.address,
        city: values.city,
        area: values.area,
        postalCode: values.postalCode,
        paymentMethod: values.paymentMethod,
        notes: values.notes,
      };
      
      console.log('Creating pending order...');
      
      // Create the order with pending status
      const order = user 
        ? await orderApi.createOrder({ ...orderData, status: 'pending' })
        : await orderApi.createGuestOrder(sessionId, { ...orderData, status: 'pending' });
      
      console.log('Order created:', order);
      
      // Prepare payment data for SSLCommerz
      const paymentData = {
        orderId: order._id,
        amount: total.toFixed(2),
        currency: 'BDT',
        customerInfo: {
          name: `${values.firstName} ${values.lastName || ''}`.trim(),
          email: values.email || `${values.phone}@scarlet.com`,
          phone: values.phone,
          address: values.address,
          city: values.city,
          country: 'Bangladesh',
          postcode: values.postalCode,
        },
        items: cartItems.map(item => ({
          name: item.title,
          category: 'Beauty',
          quantity: item.quantity,
          price: item.price.amount.toFixed(2),
        })),
      };
      
      console.log('Creating payment session...');
      
      // Create SSLCommerz payment session
      const paymentResponse = await paymentApi.createPayment(paymentData);
      
      console.log('Payment response:', paymentResponse);
      
      if (!paymentResponse.success || !paymentResponse.data) {
        const errorMsg = paymentResponse.error || 'Failed to create payment session';
        console.error('Payment creation failed:', errorMsg, paymentResponse);
        throw new Error(errorMsg);
      }
      
      console.log('Payment session created:', paymentResponse.data);
      
      // Store order ID in session storage for payment completion
      sessionStorage.setItem('scarlet_pending_order_id', order._id);
      
      // Redirect to SSLCommerz payment gateway
      window.location.href = paymentResponse.data.gatewayUrl;
      
    } catch (error) {
      console.error('SSLCommerz payment error:', error);
      throw error;
    }
  };

  // Helper function to handle direct order placement (COD)
  const handleDirectOrder = async () => {
    try {
      console.log('Creating direct order...');
      
      // Import the order API
      const { orderApi } = await import('../../lib/api');
      
      // Create order data matching backend interface
      const orderData = {
        firstName: values.firstName,
        lastName: values.lastName || undefined,
        email: values.email || undefined,
        phone: values.phone,
        address: values.address,
        city: values.city,
        area: values.area,
        postalCode: values.postalCode,
        paymentMethod: values.paymentMethod,
        notes: values.notes,
      };
      
      console.log('Order data:', orderData);

      // Create the order (authenticated or guest)
      const order = user 
        ? await orderApi.createOrder(orderData)
        : await orderApi.createGuestOrder(sessionId, orderData);
      
      addToast({
        type: 'success',
        title: 'Order Placed Successfully!',
        message: `Order #${order.orderNumber} has been placed. You will receive a confirmation email shortly.`
      });
      
      // Set order placed flag before clearing cart
      setOrderPlaced(true);
      
      // Clear verified phone from sessionStorage
      sessionStorage.removeItem('scarlet_verified_guest_phone');
      
      // Clear the cart first, then redirect
      try {
        await clearCart();
        console.log('Cart cleared successfully');
      } catch (error) {
        console.error('Error clearing cart after order:', error);
        // Continue with redirect even if cart clearing fails
      }
      
      // Redirect to order confirmation page
      router.push(`/checkout/success?orderId=${order._id}`);
      
    } catch (error) {
      console.error('Direct order error:', error);
      throw error;
    }
  };
  
  // Check for verified guest phone from URL params or session
  const [verifiedGuestPhone, setVerifiedGuestPhone] = React.useState<string | null>(null);
  const [isGuestPhoneVerified, setIsGuestPhoneVerified] = React.useState(false);
  const [orderPlaced, setOrderPlaced] = React.useState(false);
  
  const [cartItems, setCartItems] = React.useState<CartItemData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [step, setStep] = React.useState<'shipping' | 'payment' | 'review'>('shipping');

  // Check for verified guest phone on mount
  React.useEffect(() => {
    if (!user) {
      // Check URL params for verified phone
      const urlParams = new URLSearchParams(window.location.search);
      const phone = urlParams.get('verifiedPhone');
      if (phone) {
        setVerifiedGuestPhone(phone);
        setIsGuestPhoneVerified(true);
        // Store in sessionStorage for persistence
        sessionStorage.setItem('scarlet_verified_guest_phone', phone);
      } else {
        // Check sessionStorage as fallback
        const storedPhone = sessionStorage.getItem('scarlet_verified_guest_phone');
        if (storedPhone) {
          setVerifiedGuestPhone(storedPhone);
          setIsGuestPhoneVerified(true);
        }
      }
    }
  }, [user]);

  // Form handling
  const { values, errors, handleChange, handleSubmit, isValid, setFieldValue } = useForm<CheckoutFormData>({
    initialValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || verifiedGuestPhone || '',
      address: '',
      city: 'Dhaka',
      area: '',
      postalCode: '',
      paymentMethod: 'bkash',
      notes: '',
      acceptTerms: false,
    },
    validate: (values) => {
      const errors: Partial<Record<keyof CheckoutFormData, string>> = {};
      
      if (!values.firstName || values.firstName.length < 2) {
        errors.firstName = 'First name is required and must be at least 2 characters';
      }
      
      // Last name is optional - no validation needed
      
      // Email is optional, but if provided, must be valid
      if (values.email && values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
        errors.email = 'Please enter a valid email address';
      }
      
      if (!values.phone || !/^(\+88)?01[3-9]\d{8}$/.test(values.phone)) {
        errors.phone = 'Please enter a valid Bangladesh phone number';
      }
      
      if (!values.address || values.address.length < 10) {
        errors.address = 'Address is required and must be at least 10 characters';
      }
      
      if (!values.city) {
        errors.city = 'City is required';
      }
      
      if (!values.area) {
        errors.area = 'Area/Thana is required';
      }
      
      if (!values.postalCode || !/^\d{4}$/.test(values.postalCode)) {
        errors.postalCode = 'Postal code must be 4 digits';
      }
      
      if (!values.paymentMethod) {
        errors.paymentMethod = 'Payment method is required';
      }
      
      if (!values.acceptTerms) {
        errors.acceptTerms = 'You must accept the terms and conditions';
      }
      
      return errors;
    },
    onSubmit: async (formData) => {
      // This will be handled by handlePlaceOrder
    },
  });

  // Update form phone when verified guest phone is set
  React.useEffect(() => {
    if (!user && verifiedGuestPhone && isGuestPhoneVerified) {
      setFieldValue('phone', verifiedGuestPhone);
    }
  }, [verifiedGuestPhone, isGuestPhoneVerified, user, setFieldValue]);

  // Clear verified phone from sessionStorage when order is placed or user leaves
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      if (orderPlaced) {
        sessionStorage.removeItem('scarlet_verified_guest_phone');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [orderPlaced]);

  // Fetch cart data and enrich with product details
  React.useEffect(() => {
    const fetchCartData = async () => {
      setLoading(true);
      try {
        console.log('Cart data:', cart);
        
        if (!cart?.items || cart.items.length === 0) {
          console.log('No cart items found');
          // Don't redirect to cart if an order was just placed
          if (!orderPlaced) {
            console.log('Redirecting to cart');
            router.push('/cart');
          }
          return;
        }

        console.log('Cart items:', cart.items);

        // Fetch all products to enrich cart items
        const allProducts = await productApi.getProducts();
        console.log('Products fetched:', allProducts);
        
        // Ensure we have the products data - handle different response structures
        let products: unknown[] = [];
        if (allProducts?.data && Array.isArray(allProducts.data)) {
          products = allProducts.data;
        } else if (Array.isArray(allProducts)) {
          // Fallback if API returns array directly
          products = allProducts;
        } else {
          console.warn('Unexpected API response structure:', allProducts);
        }
        
        console.log('Processed products array:', products);
        console.log('Products array length:', products.length);
        console.log('First product:', products[0]);
        
        // Enrich cart items with product details
        const enrichedItems: CartItemData[] = cart.items.map(item => {
          const product = products.find(p => p._id === item.productId);
          console.log(`Product for ${item.productId}:`, product);
          
          // Handle test products that don't exist in database
          if (item.productId.startsWith('test-product-')) {
            const testProductNumber = item.productId.split('-')[2] || '1';
            return {
              productId: item.productId,
              title: `Test Product ${testProductNumber}`,
              slug: `test-product-${testProductNumber}`,
              image: '/placeholder-product.jpg',
              price: { currency: 'BDT', amount: 1000 + (parseInt(testProductNumber) * 100) },
              quantity: item.quantity,
              brand: 'Test Brand',
              stock: 10
            };
          }
          
          return {
            productId: item.productId,
            title: product?.title || 'Product not found',
            slug: product?.slug || '',
            image: product?.images?.[0] || '/placeholder-product.jpg',
            price: product?.price || { currency: 'BDT', amount: 0 },
            quantity: item.quantity,
            brand: product?.brand,
            stock: product?.stock
          };
        }).filter(item => item.title !== 'Product not found');

        console.log('Enriched items:', enrichedItems);
        setCartItems(enrichedItems);
      } catch (err) {
        console.error('Error fetching cart data:', err);
        addToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load cart items'
        });
        router.push('/cart');
      } finally {
        setLoading(false);
      }
    };

    if (cart) {
      fetchCartData();
    }
  }, [cart, router, addToast]);

  // No longer redirect to login - allow guest checkout

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price.amount * item.quantity), 0);
  const freeShippingThreshold = 2000;
  const shippingCost = 100;
  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingCost;
  const total = subtotal + shipping;
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  const formatPrice = (amount: number) => `৳${amount.toLocaleString('en-US')}`;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('Form values:', values);
    console.log('Form errors:', errors);
    console.log('Form valid:', isValid);
    
    if (!isValid) {
      console.log('Form validation failed');
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the form errors before proceeding'
      });
      return;
    }

    setSubmitting(true);
    try {
      console.log('Creating order...');
      
      // Check if payment method requires SSLCommerz gateway
      const sslcommerzMethods = ['card', 'bkash', 'nagad', 'rocket'];
      
      if (sslcommerzMethods.includes(values.paymentMethod)) {
        // Handle SSLCommerz payment flow
        await handleSSLCommerzPayment();
      } else {
        // Handle direct order placement (COD)
        await handleDirectOrder();
      }
      
    } catch (error: unknown) {
      console.error('Error placing order:', error);
      
      // Handle specific error types
      let errorMessage = 'Failed to place order. Please try again.';
      
      if (error && typeof error === 'object' && 'status' in error) {
        const errorObj = error as { status: number; code?: string; message?: string };
        
        if (errorObj.status === 400) {
          if (errorObj.code === 'EMPTY_CART') {
            errorMessage = 'Your cart is empty. Please add items before placing an order.';
          } else if (errorObj.code === 'PRODUCTS_UNAVAILABLE') {
            errorMessage = 'Some products in your cart are no longer available. Please review your cart.';
          } else if (errorObj.code === 'INSUFFICIENT_STOCK') {
            errorMessage = errorObj.message || 'Some items are out of stock.';
          } else if (errorObj.code === 'VALIDATION_ERROR') {
            errorMessage = 'Please check your order details and try again.';
          }
        } else if (errorObj.status === 401) {
          errorMessage = 'Please log in to continue with your order.';
          router.push('/login?redirect=/checkout');
          return;
        }
      }
      
      addToast({
        type: 'error',
        title: 'Order Failed',
        message: errorMessage
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Guest checkout is now allowed - no authentication required

  if (loading) {
    return <CheckoutPageSkeleton />;
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <Link href="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-herlan py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/cart" className="hover:text-red-700">Cart</Link>
            <ChevronRightIcon />
            <span className="text-gray-900">Checkout</span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'shipping' ? 'bg-red-700 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">Shipping</span>
            </div>
            <div className="w-16 h-px bg-gray-300 mx-4" />
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'payment' ? 'bg-red-700 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">Payment</span>
            </div>
            <div className="w-16 h-px bg-gray-300 mx-4" />
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'review' ? 'bg-red-700 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">Review</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <form onSubmit={handlePlaceOrder}>
              {/* Shipping Information */}
              {step === 'shipping' && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input
                      label="First Name *"
                      name="firstName"
                      value={values.firstName}
                      onChange={handleChange}
                      error={errors.firstName}
                      required
                    />
                    <Input
                      label="Last Name (Optional)"
                      name="lastName"
                      value={values.lastName}
                      onChange={handleChange}
                      error={errors.lastName}
                      placeholder="Last name (optional)"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input
                      label="Email Address (Optional)"
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                      error={errors.email}
                      placeholder="Email (optional)"
                    />
                    <div>
                      <Input
                        label="Phone Number *"
                        name="phone"
                        type="tel"
                        value={values.phone}
                        onChange={handleChange}
                        error={errors.phone}
                        placeholder="01XXXXXXXXX"
                        required
                        readOnly={!user && isGuestPhoneVerified}
                        className={!user && isGuestPhoneVerified ? "bg-gray-50 cursor-not-allowed" : ""}
                      />
                      {!user && isGuestPhoneVerified && (
                        <div className="mt-2 flex items-center text-sm text-green-600">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Phone number verified via OTP</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <Input
                      label="Full Address *"
                      name="address"
                      value={values.address}
                      onChange={handleChange}
                      error={errors.address}
                      placeholder="House/Flat, Road, Block, Sector"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <select
                        name="city"
                        value={values.city}
                        onChange={(e) => handleChange({ target: { name: 'city', value: e.target.value } } as React.ChangeEvent<HTMLSelectElement>)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 bg-white"
                        required
                      >
                        <option value="Dhaka">Dhaka</option>
                        <option value="Chittagong">Chittagong</option>
                        <option value="Sylhet">Sylhet</option>
                        <option value="Rajshahi">Rajshahi</option>
                        <option value="Khulna">Khulna</option>
                        <option value="Barisal">Barisal</option>
                        <option value="Rangpur">Rangpur</option>
                        <option value="Mymensingh">Mymensingh</option>
                      </select>
                    </div>
                    <Input
                      label="Area/Thana *"
                      name="area"
                      value={values.area}
                      onChange={handleChange}
                      error={errors.area}
                      required
                    />
                    <Input
                      label="Postal Code *"
                      name="postalCode"
                      value={values.postalCode}
                      onChange={handleChange}
                      error={errors.postalCode}
                      placeholder="1000"
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={() => setStep('payment')}
                      disabled={!values.firstName || !values.phone || !values.address || !values.area || !values.postalCode}
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </div>
              )}

              {/* Payment Information */}
              {step === 'payment' && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Method</h2>
                  
                  <div className="space-y-4 mb-6">
                    {/* Mobile Banking */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Mobile Banking</h3>
                      <div className="space-y-2">
                        {[
                          { id: 'bkash', name: 'bKash', color: 'red' },
                          { id: 'nagad', name: 'Nagad', color: 'orange' },
                          { id: 'rocket', name: 'Rocket', color: 'blue' }
                        ].map(method => (
                          <label key={method.id} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-red-300">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={method.id}
                              checked={values.paymentMethod === method.id}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            <div className={`w-4 h-4 border-2 rounded-full mr-3 transition-colors ${
                              values.paymentMethod === method.id 
                                ? 'border-red-500 bg-red-500' 
                                : 'border-gray-300'
                            }`}>
                              {values.paymentMethod === method.id && (
                                <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                              )}
                            </div>
                            <div className={`px-3 py-1 rounded text-sm font-medium bg-${method.color}-100 text-${method.color}-700 mr-3`}>
                              {method.name}
                            </div>
                            <span className="text-sm text-gray-600">Pay securely with {method.name} via SSLCommerz</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Other Payment Methods */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Other Methods</h3>
                      <div className="space-y-2">
                        <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-red-300">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="card"
                            checked={values.paymentMethod === 'card'}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 border-2 rounded-full mr-3 transition-colors ${
                            values.paymentMethod === 'card' 
                              ? 'border-red-500 bg-red-500' 
                              : 'border-gray-300'
                          }`}>
                            {values.paymentMethod === 'card' && (
                              <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                            )}
                          </div>
                          <CreditCardIcon />
                          <span className="text-sm text-gray-900 ml-2">Debit/Credit Card (via SSLCommerz)</span>
                        </label>

                        <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-red-300">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cod"
                            checked={values.paymentMethod === 'cod'}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 border-2 rounded-full mr-3 transition-colors ${
                            values.paymentMethod === 'cod' 
                              ? 'border-red-500 bg-red-500' 
                              : 'border-gray-300'
                          }`}>
                            {values.paymentMethod === 'cod' && (
                              <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                            )}
                          </div>
                          <CashIcon />
                          <span className="text-sm text-gray-900 ml-2">Cash on Delivery</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={values.notes || ''}
                      onChange={(e) => handleChange({ target: { name: 'notes', value: e.target.value } } as React.ChangeEvent<HTMLTextAreaElement>)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-400"
                      placeholder="Any special delivery instructions..."
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep('shipping')}
                    >
                      Back to Shipping
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setStep('review')}
                    >
                      Review Order
                    </Button>
                  </div>
                </div>
              )}

              {/* Order Review */}
              {step === 'review' && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Review Your Order</h2>
                  
                  {/* Order Items */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.productId} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                            {item.brand && (
                              <p className="text-sm text-gray-600">{item.brand}</p>
                            )}
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {formatPrice(item.price.amount * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Details */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">
                        {values.firstName} {values.lastName ? values.lastName : ''}
                      </p>
                      <p className="text-gray-600">{values.phone}</p>
                      {values.email && <p className="text-gray-600">{values.email}</p>}
                      <p className="text-gray-600 mt-2">
                        {values.address}<br />
                        {values.area}, {values.city} {values.postalCode}
                      </p>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900 capitalize">
                        {values.paymentMethod === 'cod' ? 'Cash on Delivery' : values.paymentMethod}
                      </p>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="mb-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="acceptTerms"
                        checked={values.acceptTerms}
                        onChange={handleChange}
                        className="mt-1"
                        required
                      />
                      <span className="text-sm text-gray-600">
                        I agree to the{' '}
                        <Link href="/terms" className="text-red-700 hover:text-red-800">
                          Terms and Conditions
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-red-700 hover:text-red-800">
                          Privacy Policy
                        </Link>
                      </span>
                    </label>
                    {errors.acceptTerms && (
                      <p className="text-red-500 text-sm mt-1">{errors.acceptTerms}</p>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep('payment')}
                    >
                      Back to Payment
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting || !values.acceptTerms}
                      className="bg-red-700 hover:bg-red-800"
                    >
                      {submitting ? (
                        <div className="flex items-center gap-2">
                          <LoadingSpinner />
                          Placing Order...
                        </div>
                      ) : (
                        `Place Order - ${formatPrice(total)}`
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                  </span>
                  <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-900">
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
                  </span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-semibold text-gray-900">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Free Shipping Banner */}
              {subtotal < freeShippingThreshold && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <ShippingIcon />
                    <span className="text-sm font-medium text-red-900">
                      Add {formatPrice(freeShippingThreshold - subtotal)} more for free shipping!
                    </span>
                  </div>
                  <div className="w-full bg-red-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((subtotal / freeShippingThreshold) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {subtotal >= freeShippingThreshold && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2">
                    <CheckIcon />
                    <span className="text-sm font-medium text-green-800">
                      You qualify for free shipping!
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-herlan py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="h-6 bg-gray-200 rounded w-40 mb-6" />
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-12 bg-gray-200 rounded" />
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded w-32 mb-6" />
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-20" />
                      <div className="h-4 bg-gray-200 rounded w-16" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icon Components
function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  );
}

function CashIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  );
}

function ShippingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-700">
      <path d="M16 3h5v5"/>
      <path d="M8 3H3v5"/>
      <path d="M12 22V8"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg 
      className="animate-spin h-5 w-5" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}