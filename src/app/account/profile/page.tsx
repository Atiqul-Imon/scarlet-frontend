"use client";
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/context';
import AccountLayout from '../../../components/account/AccountLayout';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useForm } from '../../../lib/hooks';
import { validators } from '../../../lib/utils';
import { User } from '../../../lib/types';
import { authApi } from '../../../lib/api';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
}


export default function ProfilePage(): React.JSX.Element {
  const router = useRouter();
  const { user, loading: authLoading, updateProfile } = useAuth();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/account/profile');
    }
  }, [user, authLoading, router]);
  const [isEditing, setIsEditing] = React.useState(false);
  const [otpSent, setOtpSent] = React.useState(false);
  const [otp, setOtp] = React.useState('');
  const [otpVerified, setOtpVerified] = React.useState(false);
  const [sendingOtp, setSendingOtp] = React.useState(false);
  const [verifyingOtp, setVerifyingOtp] = React.useState(false);
  const [otpError, setOtpError] = React.useState('');

  const initialValues: ProfileFormData = {
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
  };

  const validateForm = (values: ProfileFormData): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Required field validations
    const requiredError = validators.required(values['firstName'], 'firstName');
    if (requiredError) errors['firstName'] = requiredError.message;

    // Last name is now optional - no validation needed

    // Phone is now required - but no format validation, will be validated via OTP
    const phoneRequiredError = validators.required(values['phone'], 'phone');
    if (phoneRequiredError) {
      errors['phone'] = phoneRequiredError.message;
    }

    // Email is optional but must be valid if provided
    if (values['email']) {
      const emailError = validators.email(values['email']);
      if (emailError) errors['email'] = emailError.message;
    }

    return errors;
  };

  const handleSubmit = async (values: ProfileFormData) => {
    try {
      // Check if phone number has changed and needs verification
      if (values.phone !== user?.phone && !otpVerified) {
        setOtpError('Please verify your phone number with OTP before saving');
        return;
      }

      const updates: Partial<User> = {
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        ...(values.email && { email: values.email }),
        ...(values.dateOfBirth && { dateOfBirth: values.dateOfBirth }),
      };

      await updateProfile(updates);
      setIsEditing(false);
      setOtpSent(false);
      setOtp('');
      setOtpVerified(false);
      setOtpError('');
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  const form = useForm<ProfileFormData>({
    initialValues,
    validate: validateForm,
    onSubmit: handleSubmit,
    validateOnChange: false,
    validateOnBlur: true,
  });

  // Update form values when user data changes
  React.useEffect(() => {
    if (user) {
      form.setFieldValue('firstName', user.firstName || '');
      form.setFieldValue('lastName', user.lastName || '');
      form.setFieldValue('email', user.email || '');
      // Clean up invalid phone values (like '0')
      const cleanPhone = user.phone && user.phone !== '0' ? user.phone : '';
      form.setFieldValue('phone', cleanPhone);
      form.setFieldValue('dateOfBirth', user.dateOfBirth || '');
    }
  }, [user]);


  const handleSendOtp = async () => {
    const phoneNumber = form.values.phone;
    if (!phoneNumber) {
      setOtpError('Please enter a phone number');
      return;
    }

    setSendingOtp(true);
    setOtpError('');
    try {
      // Call API to send OTP
      const data = await authApi.sendPhoneOtp(phoneNumber);
      setOtpSent(true);
      setOtpError('');
    } catch (error) {
      console.error('Error sending OTP:', error);
      setOtpError(error instanceof Error ? error.message : 'Failed to send OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setOtpError('Please enter the OTP');
      return;
    }

    setVerifyingOtp(true);
    setOtpError('');
    try {
      // Call API to verify OTP
      await authApi.verifyPhoneOtp(form.values.phone, otp);
      setOtpVerified(true);
      setOtpError('');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setOtpError(error instanceof Error ? error.message : 'Invalid OTP. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleCancel = () => {
    form.resetForm();
    setIsEditing(false);
    setOtpSent(false);
    setOtp('');
    setOtpVerified(false);
    setOtpError('');
  };

  const handleEdit = () => {
    setIsEditing(true);
    // Check if phone is already verified (if user has isPhoneVerified property)
    const userWithPhone = user as any;
    if (userWithPhone?.isPhoneVerified && user?.phone === form.values.phone) {
      setOtpVerified(true);
    }
  };

  // Show loading or redirect - don't render if not authenticated
  if (authLoading || !user) {
    if (!authLoading && !user) {
      return <></>; // Will redirect
    }
    return (
      <AccountLayout>
        <div className="max-w-2xl animate-pulse">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
      <div className="max-w-2xl">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
              <p className="text-sm text-gray-600 mt-1">
                Update your personal information and preferences
              </p>
            </div>
            {!isEditing && (
              <Button onClick={handleEdit}>
                Edit Profile
              </Button>
            )}
          </div>

          <form onSubmit={form.handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={form.values.firstName}
                    onChange={form.handleChange}
                    onBlur={() => form.handleBlur('firstName')}
                    {...(form.touched.firstName && form.errors.firstName && { error: form.errors.firstName })}
                    disabled={!isEditing}
                    fullWidth
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={form.values.lastName}
                    onChange={form.handleChange}
                    onBlur={() => form.handleBlur('lastName')}
                    {...(form.touched.lastName && form.errors.lastName && { error: form.errors.lastName })}
                    disabled={!isEditing}
                    placeholder="Optional"
                    fullWidth
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.values.email}
                    onChange={form.handleChange}
                    onBlur={() => form.handleBlur('email')}
                    {...(form.touched.email && form.errors.email && { error: form.errors.email })}
                    disabled={!isEditing}
                    placeholder="Optional"
                    fullWidth
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number * {otpVerified && <span className="text-green-600 text-xs ml-2">✓ Verified</span>}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.values.phone}
                      onChange={(e) => {
                        form.handleChange(e);
                        // Reset OTP state when phone changes
                        if (e.target.value !== form.values.phone) {
                          setOtpSent(false);
                          setOtp('');
                          setOtpVerified(false);
                          setOtpError('');
                        }
                      }}
                      onBlur={() => form.handleBlur('phone')}
                      {...(form.touched.phone && form.errors.phone && { error: form.errors.phone })}
                      disabled={!isEditing || otpVerified}
                      placeholder="+880 1234 567 890"
                      fullWidth={false}
                      className="flex-1"
                    />
                    {isEditing && !otpVerified && (
                      <Button
                        type="button"
                        onClick={handleSendOtp}
                        loading={sendingOtp}
                        disabled={!form.values.phone || sendingOtp}
                        variant="secondary"
                      >
                        {otpSent ? 'Resend OTP' : 'Send OTP'}
                      </Button>
                    )}
                  </div>
                  
                  {/* OTP Input Field */}
                  {isEditing && otpSent && !otpVerified && (
                    <div className="mt-3">
                      <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                        Enter OTP
                      </label>
                      <div className="flex gap-2">
                        <Input
                          id="otp"
                          name="otp"
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="Enter 4-digit OTP"
                          maxLength={4}
                          fullWidth={false}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={handleVerifyOtp}
                          loading={verifyingOtp}
                          disabled={!otp || otp.length < 4 || verifyingOtp}
                        >
                          Verify
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* OTP Error Message */}
                  {otpError && (
                    <p className="mt-2 text-sm text-red-600">{otpError}</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <div className="relative md:w-1/2">
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={form.values.dateOfBirth}
                    onChange={form.handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:opacity-50 disabled:bg-gray-100 text-gray-700"
                    style={{
                      colorScheme: 'light'
                    }}
                  />
                  {!form.values.dateOfBirth && !isEditing && (
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 text-sm">
                      Select date
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">Format: mm/dd/yyyy</p>
              </div>
            </div>


            {/* Action Buttons */}
            {isEditing && (
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={form.isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={form.isSubmitting}
                  disabled={form.isSubmitting}
                >
                  Save Changes
                </Button>
              </div>
            )}
          </form>

          {/* Account Information */}
          {!isEditing && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Account Created</p>
                  <p className="font-medium text-gray-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Account Type</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {user?.role || 'Customer'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Email Verified</p>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user?.isEmailVerified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user?.isEmailVerified ? 'Verified' : 'Pending'}
                    </span>
                    {!user?.isEmailVerified && (
                      <button className="text-red-700 hover:text-red-800 text-xs font-medium">
                        Resend Verification
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AccountLayout>
  );
}
