'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from '@/lib/hooks';
import { authApi } from '@/lib/api';
import { useAuth, useToast } from '@/lib/context';

interface ForgotPasswordFormData {
  identifier: string;
}

interface OtpFormData {
  otp: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'identifier' | 'otp'>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState<string>('');

  const identifierForm = useForm<ForgotPasswordFormData>({
    initialValues: {
      identifier: '',
    },
    validate: (values) => {
      const errors: Partial<ForgotPasswordFormData> = {};
      
      if (!values.identifier) {
        errors.identifier = 'Phone number or email is required';
      } else if (values.identifier.includes('@')) {
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(values.identifier)) {
          errors.identifier = 'Please enter a valid email address';
        }
      } else {
        // Phone validation (Bangladesh format)
        const phoneRegex = /^(\+88)?01[3-9]\d{8}$/;
        if (!phoneRegex.test(values.identifier)) {
          errors.identifier = 'Please enter a valid phone number (01XXXXXXXXX)';
        }
      }
      
      return errors;
    },
    onSubmit: async (values) => {
      setIsLoading(true);
      setError('');
      
      try {
        // Send OTP to phone/email
        await authApi.requestLoginOTP(values.identifier);
        setIdentifier(values.identifier);
        setStep('otp');
        addToast({
          type: 'success',
          title: 'OTP Sent',
          message: `Verification code sent to ${values.identifier}`
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send OTP');
      } finally {
        setIsLoading(false);
      }
    },
  });

  const otpForm = useForm<OtpFormData>({
    initialValues: {
      otp: '',
    },
    validate: (values) => {
      const errors: Partial<OtpFormData> = {};
      if (!values.otp || values.otp.length !== 4) {
        errors.otp = 'Please enter the 4-digit code';
      }
      return errors;
    },
    onSubmit: async (values) => {
      setIsLoading(true);
      setError('');
      
      try {
        // Verify OTP and login immediately
        const response = await authApi.verifyLoginOTP(identifier, values.otp);
        
        // Auto-login with returned tokens
        login(response.user, response.tokens.accessToken, response.tokens.refreshToken);
        
        addToast({
          type: 'success',
          title: 'Welcome Back!',
          message: 'You have been logged in successfully.'
        });
        
        // Redirect to account page
        router.push('/account');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid OTP. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
  });

  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <Link href="/" className="text-3xl font-bold text-red-700">Scarlet</Link>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Enter Verification Code
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We sent a 4-digit code to <strong>{identifier}</strong>
            </p>
          </div>

          <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form onSubmit={otpForm.handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  maxLength={4}
                  placeholder="Enter 4-digit code"
                  value={otpForm.values.otp}
                  onChange={otpForm.handleChange}
                  error={otpForm.errors.otp}
                  className="text-center text-2xl tracking-widest"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>

              <Button
                type="submit"
                fullWidth
                loading={isLoading}
                disabled={!otpForm.isValid || isLoading}
              >
                Verify & Login
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep('identifier');
                    setError('');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  ← Use different phone/email
                </button>
                <span className="mx-2 text-gray-400">|</span>
                <button
                  type="button"
                  onClick={() => identifierForm.handleSubmit()}
                  className="text-sm text-red-700 hover:text-red-500 font-medium"
                  disabled={isLoading}
                >
                  Resend Code
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link href="/" className="text-3xl font-bold text-red-700">Scarlet</Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Quick Login with OTP
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your phone number or email to receive a verification code
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={identifierForm.handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <Input
                label="Phone Number or Email"
                name="identifier"
                type="text"
                value={identifierForm.values.identifier}
                onChange={identifierForm.handleChange}
                error={identifierForm.errors.identifier}
                placeholder="01XXXXXXXXX or email@example.com"
                required
                autoFocus
              />
              <p className="mt-2 text-xs text-gray-500">
                💡 We'll send you a verification code to login instantly
              </p>
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={isLoading}
                disabled={!identifierForm.isValid}
              >
                Send Verification Code
              </Button>
            </div>

            <div className="text-center">
              <Link href="/login" className="font-medium text-red-700 hover:text-red-500">
                ← Back to Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
