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
import { 
  bangladeshDivisions, 
  dhakaAreas, 
  getDivisionById, 
  getDistrictById,
  type Division,
  type District,
  type Upazilla,
  type DhakaArea
} from '../../lib/data/bangladesh-locations';

interface CheckoutFormData {
  // Shipping Information
  firstName: string;
  lastName?: string; // Made optional
  email?: string; // Optional, but required if phone not provided
  phone?: string; // Optional, but required if email not provided
  address: string;
  deliveryArea: 'inside_dhaka' | 'outside_dhaka'; // Location selection
  // Inside Dhaka fields
  dhakaArea?: string; // Thana/Area in Dhaka
  // Outside Dhaka fields
  division?: string; // Division/City
  district?: string; // District/Zilla
  upazilla?: string; // Upazilla
  // Legacy fields (keep for backward compatibility)
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
  selectedSize?: string;
  selectedColor?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, sessionId, refreshCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();

  // Helper function to handle SSLCommerz payment flow
  const handleSSLCommerzPayment = async () => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Initiating SSLCommerz payment...');
      }
      
      // Import the payment API
      const { paymentApi } = await import('../../lib/api');
      const { orderApi } = await import('../../lib/api');
      
      // First create a pending order with location-based fields
      const orderData = {
        firstName: values.firstName,
        lastName: values.lastName || undefined,
        email: values.email || undefined,
        phone: values.phone || undefined,
        address: values.address,
        deliveryArea: values.deliveryArea,
        dhakaArea: values.dhakaArea || undefined,
        division: values.division || undefined,
        district: values.district || undefined,
        upazilla: values.upazilla || undefined,
        city: values.city,
        area: values.area,
        postalCode: values.postalCode,
        paymentMethod: values.paymentMethod,
        notes: values.notes,
      };
      
      // Create the order with pending status
      const order = user 
        ? await orderApi.createOrder(orderData)
        : await orderApi.createGuestOrder(sessionId, orderData);
      
      // CRITICAL: Use orderNumber (not _id) for SSLCommerz tran_id
      // The IPN handler looks up orders by orderNumber, so they must match
      const orderNumber = order.orderNumber || order._id;
      
      // Prepare payment data for SSLCommerz
      const paymentData = {
        orderId: orderNumber,
        amount: total.toFixed(2),
        currency: 'BDT',
        customerInfo: {
          name: `${values.firstName} ${values.lastName || ''}`.trim(),
          email: values.email || `${values.phone}@scarlet.com`,
          phone: values.phone || undefined,
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
      
      // Create SSLCommerz payment session
      const paymentResponse = await paymentApi.createPayment(paymentData);
      
      if (!paymentResponse.success || !paymentResponse.data) {
        const errorMsg = paymentResponse.error || 'Failed to create payment session';
        if (process.env.NODE_ENV === 'development') {
          console.error('Payment creation failed:', errorMsg, paymentResponse);
        }
        throw new Error(errorMsg);
      }
      
      // Store order ID in session storage for payment completion
      sessionStorage.setItem('scarlet_pending_order_id', order._id);
      
      // Redirect to SSLCommerz payment gateway
      window.location.href = paymentResponse.data.gatewayUrl;
      
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('SSLCommerz payment error:', error);
      }
      throw error;
    }
  };

  // Helper function to handle direct order placement (COD)
  const handleDirectOrder = async () => {
    try {
      // Import the order API
      const { orderApi } = await import('../../lib/api');
      
      // Create order data matching backend interface with location-based fields
      const orderData = {
        firstName: values.firstName,
        lastName: values.lastName || undefined,
        email: values.email || undefined,
        phone: values.phone || undefined,
        address: values.address,
        deliveryArea: values.deliveryArea,
        dhakaArea: values.dhakaArea || undefined,
        division: values.division || undefined,
        district: values.district || undefined,
        upazilla: values.upazilla || undefined,
        city: values.city,
        area: values.area,
        postalCode: values.postalCode,
        paymentMethod: values.paymentMethod,
        notes: values.notes,
      };

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
        // Clear session storage
        sessionStorage.removeItem('scarlet_verified_guest_phone');
        sessionStorage.removeItem('scarlet_pending_order_id');
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error clearing cart after order:', error);
        }
        addToast({
          type: 'warning',
          title: 'Notice',
          message: 'Order placed successfully, but cart clearing encountered an issue. Your cart will be cleared on the next page.'
        });
        // Continue with redirect even if cart clearing fails
      }
      
      // Redirect to order confirmation page
      router.push(`/checkout/success?orderId=${order._id}`);
      
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Direct order error:', error);
      }
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
  const [step, setStep] = React.useState<'shipping' | 'payment'>('shipping');
  
  // Location state for dropdowns
  const [selectedDivision, setSelectedDivision] = React.useState<Division | null>(null);
  const [selectedDistrict, setSelectedDistrict] = React.useState<District | null>(null);
  const [selectedUpazilla, setSelectedUpazilla] = React.useState<Upazilla | null>(null);

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
      phone: (user?.phone || verifiedGuestPhone) || undefined,
      address: '',
      deliveryArea: 'inside_dhaka', // Default to Inside Dhaka
      dhakaArea: '',
      division: '',
      district: '',
      upazilla: '',
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
      
      // Email OR Phone is required (at least one must be provided)
      // Handle both undefined and empty strings properly
      const emailValue = values.email?.trim() || '';
      const phoneValue = values.phone?.trim() || '';
      const hasEmail = emailValue.length > 0;
      const hasPhone = phoneValue.length > 0;
      
      // At least one is required
      if (!hasEmail && !hasPhone) {
        errors.email = 'Email or phone number is required (at least one)';
        errors.phone = 'Email or phone number is required (at least one)';
      } else {
        // Clear errors on the field that's not required if the other is provided
        // Only show error on the field that actually needs to be filled
        if (hasEmail && !hasPhone) {
          // Email provided, phone not required - clear phone error if exists
          delete errors.phone;
        }
        if (hasPhone && !hasEmail) {
          // Phone provided, email not required - clear email error if exists
          delete errors.email;
        }
      }
      
      // Validate email if provided
      if (hasEmail) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
          errors.email = 'Please enter a valid email address';
        }
      }
      
      // Validate phone if provided (still Bangladesh format)
      if (hasPhone) {
        if (!/^(\+88)?01[3-9]\d{8}$/.test(phoneValue)) {
          errors.phone = 'Please enter a valid Bangladesh phone number';
        }
      }
      
      if (!values.address || values.address.length < 10) {
        errors.address = 'Address is required and must be at least 10 characters';
      }
      
      if (!values.city) {
        errors.city = 'City is required';
      }
      
      // Validate location fields based on delivery area
      if (values.deliveryArea === 'inside_dhaka') {
        if (!values.dhakaArea) {
          errors.dhakaArea = 'Please select a Thana/Area in Dhaka';
        }
      } else if (values.deliveryArea === 'outside_dhaka') {
        if (!values.division) {
          errors.division = 'Please select a Division/City';
        }
        if (!values.district) {
          errors.district = 'Please select a District (Zilla)';
        }
        if (!values.upazilla) {
          errors.upazilla = 'Please select an Upazilla';
        }
      }
      
      // Keep area for backward compatibility (will be set from dhakaArea or upazilla)
      if (!values.area && values.deliveryArea === 'inside_dhaka' && !values.dhakaArea) {
        errors.area = 'Area/Thana is required';
      }
      
      // Postal code is only required for outside Dhaka
      if (values.deliveryArea === 'outside_dhaka') {
        if (!values.postalCode || !/^\d{4}$/.test(values.postalCode)) {
          errors.postalCode = 'Postal code must be 4 digits';
        }
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
        if (!cart?.items || cart.items.length === 0) {
          // Don't redirect to cart if an order was just placed
          if (!orderPlaced) {
            router.push('/cart');
          }
          return;
        }

        // PERFORMANCE: Fetch only products in cart using parallel requests
        // This is much faster than fetching all products (could be thousands)
        const productIds = [...new Set(cart.items.map(item => item.productId).filter((id): id is string => !!id))]; // Remove duplicates and undefined
        const productPromises = productIds.map(id => {
          // Handle test products
          if (id.startsWith('test-product-')) {
            return Promise.resolve(null);
          }
          return productApi.getProductById(id).catch(err => {
            // Log but don't fail - we'll handle missing products gracefully
            if (process.env.NODE_ENV === 'development') {
              console.warn(`Failed to fetch product ${id}:`, err);
            }
            return null;
          });
        });

        const products = await Promise.all(productPromises);
        
        // Track missing products for user notification
        const missingProducts: string[] = [];
        
        // Create a Map for O(1) lookups instead of O(n) find operations
        const productMap = new Map<string, any>();
        products.forEach((product, index) => {
          const productId = productIds[index];
          if (!productId) return;
          
          if (product) {
            productMap.set(productId, product);
          } else if (!productId.startsWith('test-product-')) {
            // Track missing products (excluding test products)
            missingProducts.push(productId);
          }
        });
        
        // Show warning if some products are missing
        if (missingProducts.length > 0) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Some products could not be fetched:', missingProducts);
          }
          addToast({
            type: 'warning',
            title: 'Some products unavailable',
            message: `${missingProducts.length} product(s) in your cart could not be loaded. Please review your cart.`
          });
        }
        
        // Enrich cart items with product details using Map lookup (O(1) vs O(n))
        const enrichedItems: CartItemData[] = cart.items.map(item => {
          // Use Map for O(1) lookup instead of array.find() O(n)
          const product = productMap.get(item.productId);
          
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
              stock: 10,
              selectedSize: item.selectedSize,
              selectedColor: item.selectedColor
            };
          }
          
          // If product is missing, mark it but keep it for now (user should see what's in cart)
          if (!product) {
            return {
              productId: item.productId,
              title: 'Product unavailable',
              slug: '',
              image: '/placeholder-product.jpg',
              price: { currency: 'BDT', amount: 0 },
              quantity: item.quantity,
              brand: undefined,
              stock: 0,
              ...(item.selectedSize && { selectedSize: item.selectedSize }),
              ...(item.selectedColor && { selectedColor: item.selectedColor })
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
            stock: product?.stock,
            ...(item.selectedSize && { selectedSize: item.selectedSize }),
            ...(item.selectedColor && { selectedColor: item.selectedColor })
          };
        });

        // Filter out only items that are completely invalid (no productId)
        const validItems = enrichedItems.filter(item => {
          if (!item.productId) return false;
          // Keep items even if they're unavailable - user should see what was in cart
          return true;
        });
        
        // If no valid items remain, redirect to cart
        if (validItems.length === 0) {
          addToast({
            type: 'error',
            title: 'Cart is empty',
            message: 'No valid products found in your cart. Please add items to your cart.'
          });
          router.push('/cart');
          return;
        }

        setCartItems(validItems);
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching cart data:', err);
        }
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

  // PERFORMANCE: Memoize calculations to avoid recalculation on every render
  const { subtotal, shipping, total, itemCount } = React.useMemo(() => {
    const freeShippingThreshold = 2000;
    const deliveryChargeInsideDhaka = 80;
    const deliveryChargeOutsideDhaka = 150;
    
    const calculatedSubtotal = cartItems.reduce((sum, item) => sum + (item.price.amount * item.quantity), 0);
    
    // Calculate shipping cost based on delivery area
    let shippingCost = 0;
    if (values.deliveryArea === 'inside_dhaka') {
      shippingCost = deliveryChargeInsideDhaka;
    } else if (values.deliveryArea === 'outside_dhaka') {
      shippingCost = deliveryChargeOutsideDhaka;
    }
    
    // Apply free shipping threshold
    const calculatedShipping = calculatedSubtotal >= freeShippingThreshold ? 0 : shippingCost;
    const calculatedTotal = calculatedSubtotal + calculatedShipping;
    const calculatedItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    return {
      subtotal: calculatedSubtotal,
      shipping: calculatedShipping,
      total: calculatedTotal,
      itemCount: calculatedItemCount
    };
  }, [cartItems, values.deliveryArea]);
  
  // Handle delivery area change - reset location fields
  const handleDeliveryAreaChange = (area: 'inside_dhaka' | 'outside_dhaka') => {
    setFieldValue('deliveryArea', area);
    if (area === 'inside_dhaka') {
      setFieldValue('division', '');
      setFieldValue('district', '');
      setFieldValue('upazilla', '');
      setFieldValue('city', 'Dhaka');
      setSelectedDivision(null);
      setSelectedDistrict(null);
      setSelectedUpazilla(null);
      } else {
        setFieldValue('dhakaArea', '');
      }
  };
  
  // Handle division change
  const handleDivisionChange = (divisionId: string) => {
    const division = getDivisionById(divisionId);
    setSelectedDivision(division || null);
    setFieldValue('division', divisionId);
    setFieldValue('district', '');
    setFieldValue('upazilla', '');
    setFieldValue('city', division?.name || '');
    setSelectedDistrict(null);
    setSelectedUpazilla(null);
  };
  
  // Handle district change
  const handleDistrictChange = (districtId: string) => {
    if (!selectedDivision) return;
    const district = getDistrictById(selectedDivision.id, districtId);
    setSelectedDistrict(district || null);
    setFieldValue('district', districtId);
    setFieldValue('upazilla', '');
    setSelectedUpazilla(null);
  };
  
  // Handle upazilla change
  const handleUpazillaChange = (upazillaId: string) => {
    if (!selectedDistrict) return;
    const upazilla = selectedDistrict.upazillas.find(u => u.id === upazillaId);
    setSelectedUpazilla(upazilla || null);
    setFieldValue('upazilla', upazillaId);
    setFieldValue('area', upazilla?.name || '');
  };
  
  // Handle Dhaka area change
  const handleDhakaAreaChange = (areaId: string) => {
    const area = dhakaAreas.find(a => a.id === areaId);
    setFieldValue('dhakaArea', areaId);
    setFieldValue('area', area?.name || '');
  };
  
  const formatPrice = (amount: number | undefined) => `৳${amount?.toLocaleString('en-US') || '0'}`;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Form submission started', { values, errors, isValid });
    }
    
    if (!isValid) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the form errors before proceeding'
      });
      return;
    }

    // Prevent double submission
    if (submitting) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Order submission already in progress, ignoring duplicate request');
      }
      return;
    }

    setSubmitting(true);
    
    try {
      // Refresh cart before placing order to check for stock/availability changes
      // PERFORMANCE: refreshCart updates cart in context, backend will validate final state
      try {
        await refreshCart();
        // Cart state will be updated via context after refreshCart completes
        // Backend validation will catch any issues (empty cart, out of stock, etc.)
      } catch (cartError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to refresh cart, continuing with order:', cartError);
        }
        // Continue with order anyway, backend will validate
      }
      
      // Final check using current cart from context (updated by refreshCart)
      if (!cart || !cart.items || cart.items.length === 0) {
        addToast({
          type: 'error',
          title: 'Cart Empty',
          message: 'Your cart is empty. Please add items before placing an order.'
        });
        setSubmitting(false);
        router.push('/cart');
        return;
      }
      
      // Import retry utility
      const { retryWithBackoff } = await import('../../lib/api');
      
      // Check if payment method requires SSLCommerz gateway
      const sslcommerzMethods = ['card', 'bkash', 'nagad', 'rocket'];
      
      if (sslcommerzMethods.includes(values.paymentMethod)) {
        // Handle SSLCommerz payment flow with retry
        await retryWithBackoff(
          () => handleSSLCommerzPayment(),
          3, // max retries
          1000, // initial delay 1s
          2 // backoff multiplier
        );
      } else {
        // Handle direct order placement (COD) with retry
        await retryWithBackoff(
          () => handleDirectOrder(),
          3, // max retries
          1000, // initial delay 1s
          2 // backoff multiplier
        );
      }
      
    } catch (error: unknown) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error placing order:', error);
      }
      
      // Handle specific error types with field-specific errors
      let errorMessage = 'Failed to place order. Please try again.';
      let errorTitle = 'Order Failed';
      const fieldErrors: Record<string, string> = {};
      
      if (error && typeof error === 'object') {
        // Handle ApiError with field information
        if ('status' in error && 'message' in error) {
          const errorObj = error as { 
            status: number; 
            code?: string; 
            message?: string;
            field?: string;
            details?: string;
          };
          
          // Extract error message
          errorMessage = errorObj.message || errorMessage;
          
          // Handle field-specific errors
          if (errorObj.field) {
            fieldErrors[errorObj.field] = errorMessage;
            // Also show a toast for field-specific errors
            addToast({
              type: 'error',
              title: `${errorObj.field.charAt(0).toUpperCase() + errorObj.field.slice(1)} Error`,
              message: errorMessage
            });
          }
          
          // Handle specific error codes
          if (errorObj.status === 400) {
            if (errorObj.code === 'EMPTY_CART') {
              errorTitle = 'Cart Empty';
              errorMessage = 'Your cart is empty. Please add items before placing an order.';
              setSubmitting(false);
              router.push('/cart');
              return;
            } else if (errorObj.code === 'PRODUCTS_UNAVAILABLE') {
              errorTitle = 'Products Unavailable';
              errorMessage = 'Some products in your cart are no longer available. Please review your cart.';
              setSubmitting(false);
              router.push('/cart');
              return;
            } else if (errorObj.code === 'INSUFFICIENT_STOCK') {
              errorTitle = 'Insufficient Stock';
              errorMessage = errorObj.message || 'Some items are out of stock. Please review your cart.';
              setSubmitting(false);
              router.push('/cart');
              return;
            } else if (errorObj.code === 'VALIDATION_ERROR') {
              errorTitle = 'Validation Error';
              // Parse validation errors from message if available
              if (errorObj.details) {
                errorMessage = errorObj.details;
              } else {
                errorMessage = errorObj.message || 'Please check your order details and try again.';
              }
            } else if (errorObj.code === 'SESSION_REQUIRED') {
              errorTitle = 'Session Expired';
              errorMessage = 'Your session has expired. Please refresh the page and try again.';
            }
          } else if (errorObj.status === 401) {
            errorTitle = 'Authentication Required';
            errorMessage = 'Please log in to continue with your order.';
            router.push('/login?redirect=/checkout');
            setSubmitting(false);
            return;
          } else if (errorObj.status === 0 || errorObj.status === 503 || errorObj.status >= 500) {
            errorTitle = 'Network Error';
            errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
          }
        }
      }
      
      // Show general error toast if not already shown
      if (!fieldErrors || Object.keys(fieldErrors).length === 0) {
        addToast({
          type: 'error',
          title: errorTitle,
          message: errorMessage
        });
      }
      
      // Update form errors with field-specific errors if available
      if (Object.keys(fieldErrors).length > 0) {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          // Set field error if the form supports it
          if (process.env.NODE_ENV === 'development') {
            console.log(`Setting error for field ${field}: ${message}`);
          }
        });
      }
      
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
                      error={errors.firstName || undefined}
                      required
                    />
                    <Input
                      label="Last Name (Optional)"
                      name="lastName"
                      value={values.lastName}
                      onChange={handleChange}
                      error={errors.lastName || undefined}
                      placeholder="Last name (optional)"
                    />
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-3">
                      Email or phone number is required (provide at least one)
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        error={errors.email || undefined}
                        placeholder="your@email.com"
                        helperText={!values.phone ? "Required if phone not provided" : "Optional"}
                      />
                      <div>
                        <Input
                          label="Phone Number"
                          name="phone"
                          type="tel"
                          value={values.phone || ''}
                          onChange={handleChange}
                          error={errors.phone || undefined}
                          placeholder="01XXXXXXXXX"
                          helperText={!values.email ? "Required if email not provided" : "Optional"}
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
                  </div>

                  {/* Delivery Area Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Delivery Location *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        values.deliveryArea === 'inside_dhaka'
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}>
                        <input
                          type="radio"
                          name="deliveryArea"
                          value="inside_dhaka"
                          checked={values.deliveryArea === 'inside_dhaka'}
                          onChange={(e) => handleDeliveryAreaChange(e.target.value as 'inside_dhaka' | 'outside_dhaka')}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 border-2 rounded-full mr-3 transition-colors ${
                          values.deliveryArea === 'inside_dhaka'
                            ? 'border-red-500 bg-red-500'
                            : 'border-gray-300'
                        }`}>
                          {values.deliveryArea === 'inside_dhaka' && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Inside Dhaka</div>
                          <div className="text-sm text-gray-600">Delivery: ৳80</div>
                        </div>
                      </label>
                      
                      <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        values.deliveryArea === 'outside_dhaka'
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}>
                        <input
                          type="radio"
                          name="deliveryArea"
                          value="outside_dhaka"
                          checked={values.deliveryArea === 'outside_dhaka'}
                          onChange={(e) => handleDeliveryAreaChange(e.target.value as 'inside_dhaka' | 'outside_dhaka')}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 border-2 rounded-full mr-3 transition-colors ${
                          values.deliveryArea === 'outside_dhaka'
                            ? 'border-red-500 bg-red-500'
                            : 'border-gray-300'
                        }`}>
                          {values.deliveryArea === 'outside_dhaka' && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Outside Dhaka</div>
                          <div className="text-sm text-gray-600">Delivery: ৳150</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Conditional Location Fields */}
                  {values.deliveryArea === 'inside_dhaka' && (
                    <div className="mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Thana/Area in Dhaka *
                        </label>
                        <select
                          name="dhakaArea"
                          value={values.dhakaArea || ''}
                          onChange={(e) => handleDhakaAreaChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 bg-white"
                          required
                        >
                          <option value="">Select Thana/Area</option>
                          {dhakaAreas.map((area) => (
                            <option key={area.id} value={area.id}>
                              {area.name}
                            </option>
                          ))}
                        </select>
                        {errors.dhakaArea && (
                          <p className="text-red-500 text-sm mt-1">{errors.dhakaArea}</p>
                        )}
                      </div>
                      
                      {/* Address field below Thana/Area for Inside Dhaka */}
                      <div className="mt-4">
                        <Input
                          label="Address *"
                          name="address"
                          value={values.address}
                          onChange={handleChange}
                          error={errors.address || undefined}
                          placeholder="House/Flat, Road, Block, Sector"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {values.deliveryArea === 'outside_dhaka' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Division/City *
                        </label>
                        <select
                          name="division"
                          value={values.division || ''}
                          onChange={(e) => handleDivisionChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 bg-white"
                          required
                        >
                          <option value="">Select Division</option>
                          {bangladeshDivisions.map((div) => (
                            <option key={div.id} value={div.id}>
                              {div.name}
                            </option>
                          ))}
                        </select>
                        {errors.division && (
                          <p className="text-red-500 text-sm mt-1">{errors.division}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          District (Zilla) *
                        </label>
                        <select
                          name="district"
                          value={values.district || ''}
                          onChange={(e) => handleDistrictChange(e.target.value)}
                          disabled={!selectedDivision}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 bg-white ${
                            !selectedDivision ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                          required
                        >
                          <option value="">Select District</option>
                          {selectedDivision?.districts.map((dist) => (
                            <option key={dist.id} value={dist.id}>
                              {dist.name}
                            </option>
                          ))}
                        </select>
                        {errors.district && (
                          <p className="text-red-500 text-sm mt-1">{errors.district}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upazilla *
                        </label>
                        <select
                          name="upazilla"
                          value={values.upazilla || ''}
                          onChange={(e) => handleUpazillaChange(e.target.value)}
                          disabled={!selectedDistrict}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 bg-white ${
                            !selectedDistrict ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                          required
                        >
                          <option value="">Select Upazilla</option>
                          {selectedDistrict?.upazillas.map((upaz) => (
                            <option key={upaz.id} value={upaz.id}>
                              {upaz.name}
                            </option>
                          ))}
                        </select>
                        {errors.upazilla && (
                          <p className="text-red-500 text-sm mt-1">{errors.upazilla}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {values.deliveryArea === 'outside_dhaka' && (
                    <>
                      <div className="mb-4">
                        <Input
                          label="Postal Code *"
                          name="postalCode"
                          value={values.postalCode}
                          onChange={handleChange}
                          error={errors.postalCode || undefined}
                          placeholder="1000"
                          required
                        />
                      </div>
                      
                      {/* Address field below Postal Code for Outside Dhaka */}
                      <div className="mb-6">
                        <Input
                          label="Address *"
                          name="address"
                          value={values.address}
                          onChange={handleChange}
                          error={errors.address || undefined}
                          placeholder="House/Flat, Road, Block, Sector"
                          required
                        />
                      </div>
                    </>
                  )}

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={() => setStep('payment')}
                      disabled={
                        !values.firstName || 
                        !values.phone || 
                        !values.address || 
                        (values.deliveryArea === 'inside_dhaka' && !values.dhakaArea) ||
                        (values.deliveryArea === 'outside_dhaka' && (!values.division || !values.district || !values.upazilla || !values.postalCode))
                      }
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

                  {/* Terms and Conditions */}
                  <div className="mb-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="acceptTerms"
                        checked={values.acceptTerms}
                        onChange={handleChange}
                        className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        required
                      />
                      <span className="text-sm text-gray-700">
                        I agree to the{' '}
                        <Link href="/terms" className="text-red-700 hover:text-red-800 underline font-medium" target="_blank">
                          Terms & Conditions
                        </Link>
                        ,{' '}
                        <Link href="/return-policy" className="text-red-700 hover:text-red-800 underline font-medium" target="_blank">
                          Return & Refund Policy
                        </Link>
                        , and{' '}
                        <Link href="/privacy" className="text-red-700 hover:text-red-800 underline font-medium" target="_blank">
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
                      onClick={() => setStep('shipping')}
                    >
                      Back to Shipping
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