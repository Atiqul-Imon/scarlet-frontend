"use client";
import * as React from 'react';
import { Button } from '../ui/button';

interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  shippingMethod: string;
  paymentMethod: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardName?: string;
}

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => Promise<void>;
  isLoading?: boolean;
}

const initialFormData: CheckoutFormData = {
  email: '',
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'US',
  phone: '',
  shippingMethod: 'standard',
  paymentMethod: 'card',
  cardNumber: '',
  expiryDate: '',
  cvv: '',
  cardName: ''
};

export default function CheckoutForm({ onSubmit, isLoading = false }: CheckoutFormProps) {
  const [formData, setFormData] = React.useState<CheckoutFormData>(initialFormData);
  const [errors, setErrors] = React.useState<Partial<CheckoutFormData>>({});
  const [currentStep, setCurrentStep] = React.useState(1);

  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<CheckoutFormData> = {};

    if (step === 1) {
      // Contact Information
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    }

    if (step === 2) {
      // Shipping Information
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.address) newErrors.address = 'Address is required';
      if (!formData.city) newErrors.city = 'City is required';
      if (!formData.state) newErrors.state = 'State is required';
      if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required';
      if (!formData.phone) newErrors.phone = 'Phone number is required';
    }

    if (step === 3 && formData.paymentMethod === 'card') {
      // Payment Information
      if (!formData.cardNumber) newErrors.cardNumber = 'Card number is required';
      if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
      if (!formData.cvv) newErrors.cvv = 'CVV is required';
      if (!formData.cardName) newErrors.cardName = 'Cardholder name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;
    
    if (currentStep < 3) {
      handleNext();
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step <= currentStep 
                  ? 'bg-red-700 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step < currentStep ? <CheckIcon /> : step}
              </div>
              {step < 3 && (
                <div className={`w-24 h-1 mx-4 ${
                  step < currentStep ? 'bg-red-700' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className={currentStep >= 1 ? 'text-red-700 font-medium' : 'text-gray-500'}>
            Contact
          </span>
          <span className={currentStep >= 2 ? 'text-red-700 font-medium' : 'text-gray-500'}>
            Shipping
          </span>
          <span className={currentStep >= 3 ? 'text-red-700 font-medium' : 'text-gray-500'}>
            Payment
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Contact Information */}
        {currentStep === 1 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4">
                <input
                  type="checkbox"
                  id="newsletter"
                  className="w-4 h-4 text-red-700 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="newsletter" className="text-sm text-gray-600">
                  Email me with news and offers
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Shipping Information */}
        {currentStep === 2 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Information</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="123 Main Street"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors ${
                      errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors ${
                      errors.zipCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.zipCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="(555) 123-4567"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Shipping Method */}
              <div className="pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Method</h3>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="shipping"
                      value="standard"
                      checked={formData.shippingMethod === 'standard'}
                      onChange={(e) => handleInputChange('shippingMethod', e.target.value)}
                      className="w-4 h-4 text-red-700 border-gray-300 focus:ring-red-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium">Standard Shipping</span>
                        <span className="text-gray-600">Free</span>
                      </div>
                      <p className="text-sm text-gray-500">5-7 business days</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="shipping"
                      value="express"
                      checked={formData.shippingMethod === 'express'}
                      onChange={(e) => handleInputChange('shippingMethod', e.target.value)}
                      className="w-4 h-4 text-red-700 border-gray-300 focus:ring-red-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium">Express Shipping</span>
                        <span className="text-gray-600">$15.99</span>
                      </div>
                      <p className="text-sm text-gray-500">2-3 business days</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Payment Information */}
        {currentStep === 3 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Information</h2>
            
            <div className="space-y-6">
              {/* Payment Method Selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      className="w-4 h-4 text-red-700 border-gray-300 focus:ring-red-500"
                    />
                    <div className="ml-3 flex-1">
                      <span className="font-medium">Credit/Debit Card</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-8 h-6 bg-gray-100 rounded text-xs flex items-center justify-center font-bold">VISA</div>
                        <div className="w-8 h-6 bg-gray-100 rounded text-xs flex items-center justify-center font-bold">MC</div>
                        <div className="w-8 h-6 bg-gray-100 rounded text-xs flex items-center justify-center font-bold">AMEX</div>
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="paypal"
                      checked={formData.paymentMethod === 'paypal'}
                      onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      className="w-4 h-4 text-red-700 border-gray-300 focus:ring-red-500"
                    />
                    <div className="ml-3">
                      <span className="font-medium">PayPal</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Credit Card Form */}
              {formData.paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors ${
                        errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="1234 5678 9012 3456"
                    />
                    {errors.cardNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        id="expiryDate"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors ${
                          errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="MM/YY"
                      />
                      {errors.expiryDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
                        CVV *
                      </label>
                      <input
                        type="text"
                        id="cvv"
                        value={formData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors ${
                          errors.cvv ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="123"
                      />
                      {errors.cvv && (
                        <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder Name *
                    </label>
                    <input
                      type="text"
                      id="cardName"
                      value={formData.cardName}
                      onChange={(e) => handleInputChange('cardName', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors ${
                        errors.cardName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="John Doe"
                    />
                    {errors.cardName && (
                      <p className="mt-1 text-sm text-red-600">{errors.cardName}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6">
          {currentStep > 1 ? (
            <Button
              type="button"
              onClick={handleBack}
              variant="secondary"
              disabled={isLoading}
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner />
                Processing...
              </div>
            ) : currentStep < 3 ? (
              'Continue'
            ) : (
              'Complete Order'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
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
