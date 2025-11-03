"use client";

import * as React from 'react';
import { Button } from '../ui/button';
import { useToast } from '../../lib/context';
import { otpApi } from '../../lib/api';
import type { OTPRequest, OTPVerification } from '../../lib/api';

interface OTPVerificationProps {
  phone?: string; // For backward compatibility
  email?: string; // New - for email verification
  identifier: string; // The actual identifier (email or phone)
  identifierType: 'email' | 'phone'; // Type of identifier
  sessionId: string;
  purpose: 'guest_checkout' | 'phone_verification' | 'password_reset';
  onVerified: (identifier: string) => void;
  onCancel: () => void;
  className?: string;
}

export default function OTPVerification({
  phone: phoneProp,
  email: emailProp,
  identifier,
  identifierType,
  sessionId,
  purpose,
  onVerified,
  onCancel,
  className = ''
}: OTPVerificationProps) {
  const { addToast } = useToast();
  const [otp, setOtp] = React.useState(['', '', '', '']);
  const [loading, setLoading] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = React.useState(5);
  const [error, setError] = React.useState<string | null>(null);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Determine identifier from props (backward compatibility)
  const actualIdentifier = identifier || phoneProp || emailProp || '';
  const actualType = identifierType || (phoneProp ? 'phone' : 'email');

  // Format phone number for display
  const formatPhone = (phone: string): string => {
    // Convert +8801XXXXXXXXX to 01XXXXXXXXX for display
    if (phone.startsWith('+8801')) {
      return '0' + phone.slice(4);
    }
    return phone;
  };

  // Format identifier for display
  const formatIdentifier = (): string => {
    if (actualType === 'phone') {
      return formatPhone(actualIdentifier);
    }
    // Mask email: user@domain.com -> u***@domain.com
    const [local, domain] = actualIdentifier.split('@');
    if (local && domain) {
      return `${local[0]}***@${domain}`;
    }
    return actualIdentifier;
  };

  // Timer for resend OTP
  React.useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Handle OTP input change (supports digit entry and clearing)
  const handleOtpChange = (index: number, value: string): void => {
    const trimmed = value.replace(/\D/g, '');
    const digit = trimmed.slice(-1);

    const newOtp = [...otp];
    if (value === '' || trimmed === '') {
      // Clear current digit when input becomes empty (mobile backspace)
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    if (digit) {
      newOtp[index] = digit;
      setOtp(newOtp);

      // Clear error when user starts typing
      if (error) setError(null);

      // Move to next input
      if (index < 3) inputRefs.current[index + 1]?.focus();
    }
  };

  // Enhanced keyboard handling
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>): void => {
    const { key } = e;
    
    switch (key) {
      case 'Backspace':
        e.preventDefault();
        const newOtp = [...otp];
        
        if (otp[index]) {
          // Clear current field
          newOtp[index] = '';
          setOtp(newOtp);
        } else if (index > 0) {
          // Move to previous field and clear it
          newOtp[index - 1] = '';
          setOtp(newOtp);
          inputRefs.current[index - 1]?.focus();
        }
        break;
        
      case 'Delete':
        e.preventDefault();
        const deleteOtp = [...otp];
        deleteOtp[index] = '';
        setOtp(deleteOtp);
        break;
        
      case 'ArrowLeft':
        e.preventDefault();
        if (index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
        break;
        
      case 'ArrowRight':
        e.preventDefault();
        if (index < 3) {
          inputRefs.current[index + 1]?.focus();
        }
        break;
        
      case 'ArrowUp':
      case 'ArrowDown':
        e.preventDefault();
        break;
        
      default:
        // Allow only digits
        if (!/\d/.test(key) && !['Tab', 'Enter'].includes(key)) {
          e.preventDefault();
        }
        break;
    }
  };

  // Mobile-friendly input handler to catch virtual keyboard deletions
  const handleInput = (index: number, e: React.FormEvent<HTMLInputElement>): void => {
    const target = e.currentTarget;
    const native = e.nativeEvent as InputEvent;
    const inputType = native && 'inputType' in native ? native.inputType : undefined;

    // If user pressed backspace on mobile virtual keyboard
    if (inputType === 'deleteContentBackward') {
      const newOtp = [...otp];
      if (newOtp[index]) {
        // Clear current if it has a value
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        // Move left and clear previous
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }

    // Guard: if user pasted or typed multiple chars, trim to last digit
    if (target.value.length > 1) {
      const digit = target.value.replace(/\D/g, '').slice(-1);
      if (digit) {
        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);
        if (index < 3) inputRefs.current[index + 1]?.focus();
      } else {
        target.value = '';
      }
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent): void => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    
    if (pastedData.length === 4) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      
      // Focus last input
      if (inputRefs.current[3]) {
        inputRefs.current[3]?.focus();
      }
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    const otpString = otp.join('');
    
    if (otpString.length !== 4) {
      setError('Please enter a 4-digit OTP code');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const verification: OTPVerification = {
        phone: actualIdentifier, // Use actual identifier (phone or email)
        code: otpString,
        sessionId,
        purpose
      };

      const result = await otpApi.verifyOTP(verification);
      
      if (result.success) {
        addToast({
          type: 'success',
          title: actualType === 'phone' ? 'Phone Verified' : 'Email Verified',
          message: actualType === 'phone' 
            ? 'Your phone number has been verified successfully!'
            : 'Your email address has been verified successfully!'
        });
        onVerified(actualIdentifier);
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      
      let errorMessage = 'Failed to verify OTP. Please try again.';
      let attemptsLeft = attemptsRemaining - 1;
      
      if (error.message?.includes('Invalid OTP')) {
        errorMessage = error.message;
        setAttemptsRemaining(attemptsLeft);
        setError(errorMessage);
      } else if (error.message?.includes('Maximum attempts exceeded')) {
        errorMessage = 'Maximum attempts exceeded. Please request a new OTP.';
        setAttemptsRemaining(0);
        setError(errorMessage);
      } else if (error.message?.includes('already been used')) {
        errorMessage = 'This OTP has already been used. Please request a new one.';
        setError(errorMessage);
      } else if (error.message?.includes('expired')) {
        errorMessage = 'OTP has expired. Please request a new one.';
        setError(errorMessage);
      } else {
        setError(errorMessage);
      }
      
      addToast({
        type: 'error',
        title: 'Verification Failed',
        message: errorMessage
      });
      
      if (attemptsLeft <= 0) {
        setOtp(['', '', '', '']);
        setTimeLeft(60); // Start timer for resend
      } else {
        // Clear OTP inputs on wrong attempt
        setOtp(['', '', '', '']);
        // Focus first input after a short delay to ensure DOM is updated
        setTimeout(() => {
          if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
          }
        }, 100);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async (): Promise<void> => {
    if (timeLeft > 0) return;
    
    setSending(true);
    try {
      const request: OTPRequest = {
        phone: actualIdentifier, // Use actual identifier (phone or email)
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
        setOtp(['', '', '', '']);
        setError(null);
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
    <div className={`bg-white rounded-xl border border-gray-200 p-6 shadow-2xl ${className}`}>
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Verify Your {actualType === 'phone' ? 'Phone Number' : 'Email Address'}
        </h3>
        <p className="text-sm text-gray-600">
          We've sent a 4-digit verification code to
        </p>
        <p className="text-sm font-medium text-gray-900">
          {formatIdentifier()}
        </p>
      </div>

      <form onSubmit={handleVerifyOTP} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter OTP Code
          </label>
          <div className="flex justify-center space-x-3" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onInput={(e) => handleInput(index, e)}
                onFocus={(e) => e.target.select()}
                onClick={(e) => e.target.select()}
                className={`
                  w-12 h-12 text-center text-2xl font-bold border-2 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500
                  transition-all duration-200 ease-in-out
                  ${error ? 'border-red-500 bg-red-50 text-red-900 animate-pulse' : 'border-gray-300'}
                  ${digit ? 'bg-red-50 border-red-300 text-gray-900 shadow-sm' : 'bg-white text-gray-900 hover:border-gray-400'}
                  text-gray-900 placeholder-gray-400
                  cursor-pointer select-all
                `}
                autoComplete="one-time-code"
                autoFocus={index === 0}
                title={`OTP digit ${index + 1}`}
              />
            ))}
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
          )}
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500 mb-1">
              Enter the 4-digit code sent to your {actualType === 'phone' ? 'phone' : 'email'}
            </p>
            <p className="text-xs text-gray-400">
              💡 Tip: Use <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">←</kbd> <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">→</kbd> arrows to navigate, <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Backspace</kbd> to clear
            </p>
          </div>
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
            disabled={otp.join('').length !== 4 || loading || attemptsRemaining <= 0}
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

      {/* Production notice */}
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
        <p className="text-xs text-green-800 text-center">
          📱 OTP has been sent to your phone via SMS
        </p>
      </div>
    </div>
  );
}
