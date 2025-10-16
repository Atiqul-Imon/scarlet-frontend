'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from '@/lib/hooks';
import { authApi } from '@/lib/api';

interface ForgotPasswordFormData {
  identifier: string;
}

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string>('');

  const { values, errors, handleChange, handleSubmit, isValid } = useForm<ForgotPasswordFormData>({
    initialValues: {
      identifier: '',
    },
    validate: (values) => {
      const errors: Partial<ForgotPasswordFormData> = {};
      
      if (!values.identifier) {
        errors.identifier = 'Email or phone number is required';
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
        await authApi.forgotPassword(values);
        setIsSubmitted(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send reset instructions');
      } finally {
        setIsLoading(false);
      }
    },
  });

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-red-700">Scarlet</h1>
            <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Check your inbox</h3>
                <p className="mt-2 text-sm text-gray-600">
                  We've sent password reset instructions to <strong>{values.identifier}</strong>
                </p>
                <p className="mt-4 text-sm text-gray-600">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="font-medium text-red-700 hover:text-red-500"
                  >
                    try again
                  </button>
                </p>
                <div className="mt-6">
                  <Link href="/login">
                    <Button variant="outline" fullWidth>
                      Back to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-700">Scarlet</h1>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Forgot your password?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email or phone number and we'll send you instructions to reset your password.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <Input
                label="Email or Phone Number"
                name="identifier"
                type="text"
                value={values.identifier}
                onChange={handleChange}
                error={errors.identifier}
                placeholder="Enter your email or phone number"
                required
              />
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={isLoading}
                disabled={!isValid}
              >
                Send Reset Instructions
              </Button>
            </div>

            <div className="text-center">
              <Link href="/login" className="font-medium text-red-700 hover:text-red-500">
                Back to Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
