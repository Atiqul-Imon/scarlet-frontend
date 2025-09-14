"use client";

import * as React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useToast } from '../../lib/context';
import { otpApi } from '../../lib/api';
import type { OTPRequest, OTPVerification } from '../../lib/api';

interface OTPVerificationProps {
  phone: string;
  sessionId: string;
  purpose: 'guest_checkout' | 'phone_verification' | 'password_reset';
  onVerified: (phone: string) => void;
  onCancel: () => void;
  className?: string;
}

export default function OTPVerification({
  phone,
  sessionId,
  purpose,
  onVerified,
  onCancel,
  className = ''
}: OTPVerificationProps) {
  const { addToast } = useToast();
  const [otp, setOtp] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = React.useState(5);

  // Format phone number for display
  const formatPhone = (phone: string) => {
    // Convert +8801XXXXXXXXX to 01XXXXXXXXX for display
    if (phone.startsWith('+8801')) {
      return '0' + phone.slice(4);
    }
    return phone;
  };

  // Timer for resend OTP
  React.useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Handle OTP input change
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    if (value.length <= 4) {
      setOtp(value);
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 4) {
      addToast({
        type: 'error',
        title: 'Invalid OTP',
        message: 'Please enter a 4-digit OTP code'
      });
      return;
    }

    setLoading(true);
    try {
      const verification: OTPVerification = {
        phone,
        code: otp,
        sessionId,
        purpose
      };

      const result = await otpApi.verifyOTP(verification);
      
      if (result.success) {
        addToast({
          type: 'success',
          title: 'Phone Verified',
          message: 'Your phone number has been verified successfully!'
        });
        onVerified(phone);
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      
      let errorMessage = 'Failed to verify OTP. Please try again.';
      let attemptsLeft = attemptsRemaining - 1;
      
      if (error.message?.includes('Invalid OTP')) {
        errorMessage = error.message;
        setAttemptsRemaining(attemptsLeft);
      } else if (error.message?.includes('Maximum attempts exceeded')) {
        errorMessage = 'Maximum attempts exceeded. Please request a new OTP.';
        setAttemptsRemaining(0);
      } else if (error.message?.includes('already been used')) {
        errorMessage = 'This OTP has already been used. Please request a new one.';
      } else if (error.message?.includes('expired')) {
        errorMessage = 'OTP has expired. Please request a new one.';
      }
      
      addToast({
        type: 'error',
        title: 'Verification Failed',
        message: errorMessage
      });
      
      if (attemptsLeft <= 0) {
        setOtp('');
        setTimeLeft(60); // Start timer for resend
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (timeLeft > 0) return;
    
    setSending(true);
    try {
      const request: OTPRequest = {
        phone,
        purpose
      };

      const result = await otpApi.generateOTP(request, sessionId);
      
      if (result.success) {
        addToast({
          type: 'success',
          title: 'OTP Sent',
          message: 'A new OTP has been sent to your phone number'
        });
        setTimeLeft(60); // 1 minute cooldown
        setAttemptsRemaining(result.attemptsRemaining || 5);
        setOtp('');
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      if (error.message?.includes('Please wait')) {
        errorMessage = error.message;
      } else if (error.message?.includes('valid Bangladesh phone number')) {
        errorMessage = 'Please enter a valid Bangladesh phone number';
      }
      
      addToast({
        type: 'error',
        title: 'Failed to Send OTP',
        message: errorMessage
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
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
          We've sent a 4-digit verification code to
        </p>
        <p className="text-sm font-medium text-gray-900">
          {formatPhone(phone)}
        </p>
      </div>

      <form onSubmit={handleVerifyOTP} className="space-y-4">
        <div>
          <Input
            label="Enter OTP Code"
            type="text"
            value={otp}
            onChange={handleOtpChange}
            placeholder="1234"
            maxLength={4}
            className="text-center text-2xl font-mono tracking-widest"
            autoComplete="one-time-code"
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the 4-digit code sent to your phone
          </p>
        </div>

        {attemptsRemaining > 0 && (
          <p className="text-sm text-gray-600 text-center">
            {attemptsRemaining} attempts remaining
          </p>
        )}

        <div className="flex flex-col space-y-3">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            disabled={otp.length !== 4 || loading || attemptsRemaining <= 0}
          >
            {loading ? 'Verifying...' : 'Verify Phone Number'}
          </Button>

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
              type="button"
              variant="outline"
              onClick={handleResendOTP}
              disabled={timeLeft > 0 || sending}
              loading={sending}
              className="flex-1"
            >
              {timeLeft > 0 ? `Resend in ${timeLeft}s` : 'Resend OTP'}
            </Button>
          </div>
        </div>
      </form>

      {/* Development notice */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-xs text-yellow-800 text-center">
            🔧 Development Mode: Check the backend console for the OTP code
          </p>
        </div>
      )}
    </div>
  );
}
