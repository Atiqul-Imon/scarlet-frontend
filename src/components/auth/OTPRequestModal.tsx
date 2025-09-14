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
  onOTPSent: (phone: string) => void;
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
  const [phone, setPhone] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setPhone('');
      setError(null);
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

  // Handle phone input change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone.trim()) {
      setError('Phone number is required');
      return;
    }

    if (!validatePhone(phone)) {
      setError('Please enter a valid Bangladesh phone number (01XXXXXXXXX)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
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
        onOTPSent(normalizedPhone);
      }
    } catch (error: any) {
      console.error('OTP generation error:', error);
      
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      if (error.message?.includes('valid Bangladesh phone number')) {
        errorMessage = 'Please enter a valid Bangladesh phone number (01XXXXXXXXX)';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-pink-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Verify Your Phone Number
          </h3>
          <p className="text-sm text-gray-600">
            {purpose === 'guest_checkout' 
              ? 'We need to verify your phone number to proceed with checkout'
              : 'Enter your phone number to receive a verification code'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              disabled={!phone.trim() || loading}
              className="flex-1"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>
          </div>
        </form>

        {/* Development notice */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs text-yellow-800 text-center">
              🔧 Development Mode: OTP will be logged to backend console
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
