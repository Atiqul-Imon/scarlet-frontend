"use client";
import * as React from 'react';
import { useAuth } from '../../../lib/context';
import AccountLayout from '../../../components/account/AccountLayout';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { useForm } from '../../../lib/hooks';
import { validators } from '../../../lib/utils';
import { User, SelectOption } from '../../../lib/types';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  preferences: {
    newsletter: boolean;
    smsNotifications: boolean;
    language: string;
    currency: string;
  };
}

const languageOptions: SelectOption[] = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
];

const currencyOptions: SelectOption[] = [
  { value: 'BDT', label: 'Bangladeshi Taka (৳)' },
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'CAD', label: 'Canadian Dollar (C$)' },
];

export default function ProfilePage(): JSX.Element {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = React.useState(false);

  const initialValues: ProfileFormData = {
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    preferences: {
      newsletter: user?.preferences?.newsletter || false,
      smsNotifications: user?.preferences?.smsNotifications || false,
      language: user?.preferences?.language || 'en',
      currency: user?.preferences?.currency || 'BDT',
    },
  };

  const validateForm = (values: ProfileFormData): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Required field validations
    const requiredError = validators.required(values.firstName, 'firstName');
    if (requiredError) errors.firstName = requiredError.message;

    const lastNameError = validators.required(values.lastName, 'lastName');
    if (lastNameError) errors.lastName = lastNameError.message;

    const emailRequiredError = validators.required(values.email, 'email');
    if (emailRequiredError) {
      errors.email = emailRequiredError.message;
    } else {
      const emailError = validators.email(values.email);
      if (emailError) errors.email = emailError.message;
    }

    // Optional phone validation
    if (values.phone) {
      const phoneError = validators.phone(values.phone);
      if (phoneError) errors.phone = phoneError.message;
    }

    return errors;
  };

  const handleSubmit = async (values: ProfileFormData) => {
    try {
      const updates: Partial<User> = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
        preferences: values.preferences,
      };

      await updateProfile(updates);
      setIsEditing(false);
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
      form.setFieldValue('phone', user.phone || '');
      form.setFieldValue('dateOfBirth', user.dateOfBirth || '');
      form.setFieldValue('preferences', {
        newsletter: user.preferences?.newsletter || false,
        smsNotifications: user.preferences?.smsNotifications || false,
        language: user.preferences?.language || 'en',
        currency: user.preferences?.currency || 'BDT',
      });
    }
  }, [user]);

  const handleCancel = () => {
    form.resetForm();
    setIsEditing(false);
  };

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
              <Button onClick={() => setIsEditing(true)}>
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
                    error={form.touched.firstName ? form.errors.firstName : undefined}
                    disabled={!isEditing}
                    fullWidth
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={form.values.lastName}
                    onChange={form.handleChange}
                    onBlur={() => form.handleBlur('lastName')}
                    error={form.touched.lastName ? form.errors.lastName : undefined}
                    disabled={!isEditing}
                    fullWidth
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.values.email}
                    onChange={form.handleChange}
                    onBlur={() => form.handleBlur('email')}
                    error={form.touched.email ? form.errors.email : undefined}
                    disabled={!isEditing}
                    fullWidth
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.values.phone}
                    onChange={form.handleChange}
                    onBlur={() => form.handleBlur('phone')}
                    error={form.touched.phone ? form.errors.phone : undefined}
                    disabled={!isEditing}
                    placeholder="(555) 123-4567"
                    fullWidth
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={form.values.dateOfBirth}
                  onChange={form.handleChange}
                  disabled={!isEditing}
                  className="md:w-1/2"
                />
              </div>
            </div>

            {/* Preferences */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <Select
                    id="language"
                    name="preferences.language"
                    options={languageOptions}
                    value={form.values.preferences.language}
                    onChange={form.handleChange}
                    disabled={!isEditing}
                    fullWidth
                  />
                </div>

                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <Select
                    id="currency"
                    name="preferences.currency"
                    options={currencyOptions}
                    value={form.values.preferences.currency}
                    onChange={form.handleChange}
                    disabled={!isEditing}
                    fullWidth
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="newsletter"
                    name="preferences.newsletter"
                    type="checkbox"
                    checked={form.values.preferences.newsletter}
                    onChange={form.handleChange}
                    disabled={!isEditing}
                    className="w-4 h-4 text-red-700 border-gray-300 rounded focus:ring-red-500 disabled:opacity-50"
                  />
                  <label htmlFor="newsletter" className="ml-3 text-sm text-gray-700">
                    Subscribe to newsletter and promotional emails
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="smsNotifications"
                    name="preferences.smsNotifications"
                    type="checkbox"
                    checked={form.values.preferences.smsNotifications}
                    onChange={form.handleChange}
                    disabled={!isEditing}
                    className="w-4 h-4 text-red-700 border-gray-300 rounded focus:ring-red-500 disabled:opacity-50"
                  />
                  <label htmlFor="smsNotifications" className="ml-3 text-sm text-gray-700">
                    Receive SMS notifications for order updates
                  </label>
                </div>
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
                  disabled={!form.isValid}
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
