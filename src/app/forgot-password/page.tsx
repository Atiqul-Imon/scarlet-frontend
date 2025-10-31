'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from '@/lib/hooks';
import { authApi, apiUtils } from '@/lib/api';
import { useAuth, useToast } from '@/lib/context';

interface ForgotPasswordFormData {
  identifier: string;
}

interface OtpFormData {
  otp: string;
}

interface NewPasswordFormData {
  password: string;
  confirmPassword: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { setUser: setAuthUser } = useAuth();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'identifier' | 'otp' | 'newPassword'>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [userInfo, setUserInfo] = useState<{ _id: string; email?: string; phone?: string; firstName: string } | null>(null);
  const [error, setError] = useState<string>('');

  // Generate session ID on mount
  React.useEffect(() => {
    setSessionId(crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15));
  }, []);

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
        // Send OTP for password reset
        const result = await authApi.sendPasswordResetOTP(values.identifier, sessionId);
        setIdentifier(values.identifier);
        if (result.sessionId) {
          setSessionId(result.sessionId);
        }
        setStep('otp');
        addToast({
          type: 'success',
          title: 'Code Sent',
          message: result.message || `Verification code sent to your phone number`
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send verification code';
        setError(errorMessage);
        addToast({
          type: 'error',
          title: 'Failed to send code',
          message: errorMessage
        });
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
        // Verify OTP and get reset token
        const response = await authApi.verifyPasswordResetOTP(identifier, values.otp, sessionId);
        
        // Store reset token and user info
        setResetToken(response.resetToken);
        setUserInfo(response.user);
        setStep('newPassword');
        
        addToast({
          type: 'success',
          title: 'Code Verified',
          message: `Please set a new password for your account`
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Invalid verification code. Please try again.';
        setError(errorMessage);
        addToast({
          type: 'error',
          title: 'Verification Failed',
          message: errorMessage
        });
      } finally {
        setIsLoading(false);
      }
    },
  });

  const newPasswordForm = useForm<NewPasswordFormData>({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validate: (values) => {
      const errors: Partial<NewPasswordFormData> = {};
      
      if (!values.password) {
        errors.password = 'Password is required';
      } else if (values.password.length < 4) {
        errors.password = 'Password must be at least 4 characters long';
      }
      
      if (!values.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (values.password !== values.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
      
      return errors;
    },
    onSubmit: async (values) => {
      if (!resetToken) {
        setError('Reset token missing. Please start over.');
        return;
      }

      setIsLoading(true);
      setError('');
      
      try {
        // Set new password and auto-login
        const response = await authApi.setNewPassword(resetToken, values.password);
        
        // Store tokens and set user to auto-login
        apiUtils.storeTokens(response.tokens);
        // Fetch full user profile to set in auth context
        const fullUser = await authApi.getProfile();
        setAuthUser(fullUser);
        
        addToast({
          type: 'success',
          title: 'Password Reset Successful!',
          message: `Welcome back, ${response.user.firstName}! You've been logged in.`
        });
        
        // Redirect to home page
        router.push('/');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to reset password. Please try again.';
        setError(errorMessage);
        addToast({
          type: 'error',
          title: 'Password Reset Failed',
          message: errorMessage
        });
      } finally {
        setIsLoading(false);
      }
    },
  });

  if (step === 'newPassword') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <Link href="/" className="text-3xl font-bold text-red-700">Scarlet</Link>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Set New Password
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {userInfo ? `Set a new password for ${userInfo.email || userInfo.phone}` : 'Set a new password for your account'}
            </p>
          </div>

          <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form onSubmit={newPasswordForm.handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  New Password *
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter new password"
                  value={newPasswordForm.values.password}
                  onChange={newPasswordForm.handleChange}
                  error={newPasswordForm.errors.password || ''}
                  required
                  autoFocus
                />
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 4 characters long
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password *
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={newPasswordForm.values.confirmPassword}
                  onChange={newPasswordForm.handleChange}
                  error={newPasswordForm.errors.confirmPassword || ''}
                  required
                />
              </div>

              <Button
                type="submit"
                fullWidth
                loading={isLoading}
                disabled={!newPasswordForm.isValid || isLoading}
              >
                Reset Password & Login
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep('otp');
                    setError('');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  ← Back to verification
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

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
                  error={otpForm.errors.otp || ''}
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
                Verify Code
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
            Reset Your Password
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
                  error={identifierForm.errors.identifier || ''}
                placeholder="01XXXXXXXXX or email@example.com"
                required
                autoFocus
              />
              <p className="mt-2 text-xs text-gray-500">
                💡 We'll send you a verification code to reset your password
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
