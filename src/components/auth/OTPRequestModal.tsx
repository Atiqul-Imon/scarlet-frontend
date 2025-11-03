"use client";

import * as React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useToast } from '../../lib/context';
import { otpApi } from '../../lib/api';
import type { OTPRequest } from '../../lib/api';

interface OTPRequestModalProps {
  sessionId: string;
  purpose: 'guest_checkout' | 'phone_verification' | 'password_reset';
  onOTPSent: (identifier: string, type: 'email' | 'phone') => void;
  onCancel: () => void;
  isOpen: boolean;
}

export default function OTPRequestModal({
  sessionId,
  purpose,
  onOTPSent,
  onCancel,
  isOpen
}: OTPRequestModalProps) {
  const { addToast } = useToast();
  const [verificationType, setVerificationType] = React.useState<'email' | 'phone'>('phone');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setPhone('');
      setEmail('');
      setError(null);
      setVerificationType('phone'); // Default to phone
    }
  }, [isOpen]);

  // Validate Bangladesh phone number
  const validatePhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    const patterns = [
      /^(\+8801|01)[3-9]\d{8}$/, // +8801XXXXXXXXX or 01XXXXXXXXX
      /^8801[3-9]\d{8}$/ // 8801XXXXXXXXX
    ];
    return patterns.some(pattern => pattern.test(cleanPhone));
  };

  // Normalize phone number
  const normalizePhone = (phone: string): string => {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    if (cleanPhone.startsWith('01')) {
      return '+88' + cleanPhone;
    } else if (cleanPhone.startsWith('8801')) {
      return '+' + cleanPhone;
    } else if (cleanPhone.startsWith('+8801')) {
      return cleanPhone;
    }
    
    return cleanPhone;
  };

  // Validate email
  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  // Handle phone input change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  // Handle email input change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError(null);

    // Validate based on verification type
    if (verificationType === 'phone') {
      if (!phone.trim()) {
        setError('Phone number is required');
        return;
      }

      if (!validatePhone(phone)) {
        setError('Please enter a valid Bangladesh phone number (01XXXXXXXXX)');
        return;
      }
    } else {
      if (!email.trim()) {
        setError('Email address is required');
        return;
      }

      if (!validateEmail(email)) {
        setError('Please enter a valid email address');
        return;
      }
    }

    setLoading(true);

    try {
      if (verificationType === 'phone') {
        const normalizedPhone = normalizePhone(phone);
        const request: OTPRequest = {
          phone: normalizedPhone,
          purpose
        };

        const result = await otpApi.generateOTP(request, sessionId);
        
        if (result.success) {
          addToast({
            type: 'success',
            title: 'OTP Sent',
            message: `A verification code has been sent to ${phone}`
          });
          onOTPSent(normalizedPhone, 'phone');
        }
      } else {
        // Email OTP - need to call API that supports email
        const result = await otpApi.generateOTP({ 
          phone: email, // Backend will detect if it's email
          purpose 
        } as OTPRequest, sessionId);
        
        if (result.success) {
          addToast({
            type: 'success',
            title: 'OTP Sent',
            message: `A verification code has been sent to ${email}`
          });
          onOTPSent(email, 'email');
        }
      }
    } catch (error: any) {
      console.error('OTP generation error:', error);
      
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      if (error.message?.includes('valid Bangladesh phone number')) {
        errorMessage = 'Please enter a valid Bangladesh phone number (01XXXXXXXXX)';
      } else if (error.message?.includes('valid email')) {
        errorMessage = 'Please enter a valid email address';
      } else if (error.message?.includes('Please wait')) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      addToast({
        type: 'error',
        title: 'Failed to Send OTP',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-red-100 via-purple-50 to-blue-100 bg-opacity-90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Verify Your Contact Information
          </h3>
          <p className="text-sm text-gray-600">
            {purpose === 'guest_checkout' 
              ? 'We need to verify your email or phone number to proceed with checkout'
              : 'Enter your email or phone number to receive a verification code'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Verification Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verify via:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setVerificationType('phone');
                  setError(null);
                }}
                className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                  verificationType === 'phone'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                📱 Phone
              </button>
              <button
                type="button"
                onClick={() => {
                  setVerificationType('email');
                  setError(null);
                }}
                className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                  verificationType === 'email'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                ✉️ Email
              </button>
            </div>
          </div>

          {/* Phone Input */}
          {verificationType === 'phone' && (
            <div>
              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="01XXXXXXXXX"
                error={error}
                autoComplete="tel"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your Bangladesh mobile number (01XXXXXXXXX)
              </p>
            </div>
          )}

          {/* Email Input */}
          {verificationType === 'email' && (
            <div>
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="your@email.com"
                error={error}
                autoComplete="email"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your email address to receive verification code
              </p>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={
                (verificationType === 'phone' && !phone.trim()) ||
                (verificationType === 'email' && !email.trim()) ||
                loading
              }
              className="flex-1"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>
          </div>
        </form>

        {/* Production notice */}
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-xs text-green-800 text-center">
            {verificationType === 'phone' 
              ? '📱 OTP will be sent to your phone via SMS'
              : '✉️ OTP will be sent to your email address'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
