"use client";
import * as React from 'react';
import AccountLayout from '../../../components/account/AccountLayout';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Modal } from '../../../components/ui/modal';
import { useForm } from '../../../lib/hooks';
import { validators } from '../../../lib/utils';
import { ShippingAddress, SelectOption } from '../../../lib/types';

interface AddressFormData extends ShippingAddress {
  isDefault: boolean;
  label: string;
}

const countryOptions: SelectOption[] = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
];

const stateOptions: SelectOption[] = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

interface SavedAddress extends AddressFormData {
  id: string;
}

export default function AddressBookPage(): JSX.Element {
  const [addresses, setAddresses] = React.useState<SavedAddress[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingAddress, setEditingAddress] = React.useState<SavedAddress | null>(null);

  React.useEffect(() => {
    const fetchAddresses = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        const mockAddresses: SavedAddress[] = [
          {
            id: '1',
            label: 'Home',
            firstName: 'John',
            lastName: 'Doe',
            address: '123 Main Street',
            address2: 'Apt 4B',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'US',
            phone: '(555) 123-4567',
            isDefault: true,
          },
          {
            id: '2',
            label: 'Office',
            firstName: 'John',
            lastName: 'Doe',
            address: '456 Business Ave',
            city: 'New York',
            state: 'NY',
            zipCode: '10002',
            country: 'US',
            phone: '(555) 987-6543',
            isDefault: false,
          },
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setAddresses(mockAddresses);
      } catch (error) {
        console.error('Error fetching addresses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  const initialFormData: AddressFormData = {
    label: '',
    firstName: '',
    lastName: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    phone: '',
    isDefault: false,
  };

  const validateForm = (values: AddressFormData): Record<string, string> => {
    const errors: Record<string, string> = {};

    const requiredFields: (keyof AddressFormData)[] = [
      'label', 'firstName', 'lastName', 'address', 'city', 'state', 'zipCode', 'country'
    ];

    requiredFields.forEach(field => {
      const error = validators.required(values[field], field);
      if (error) errors[field] = error.message;
    });

    // Phone validation (optional)
    if (values.phone) {
      const phoneError = validators.phone(values.phone);
      if (phoneError) errors.phone = phoneError.message;
    }

    return errors;
  };

  const handleSubmit = async (values: AddressFormData) => {
    try {
      if (editingAddress) {
        // Update existing address
        const updatedAddress: SavedAddress = {
          ...editingAddress,
          ...values,
        };
        
        setAddresses(prev => 
          prev.map(addr => addr.id === editingAddress.id ? updatedAddress : addr)
        );
      } else {
        // Add new address
        const newAddress: SavedAddress = {
          id: Date.now().toString(),
          ...values,
        };
        
        setAddresses(prev => [...prev, newAddress]);
      }

      // If this is set as default, remove default from others
      if (values.isDefault) {
        setAddresses(prev => 
          prev.map(addr => ({ ...addr, isDefault: addr.id === editingAddress?.id || (!editingAddress && addr === prev[prev.length - 1]) }))
        );
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const form = useForm<AddressFormData>({
    initialValues: initialFormData,
    validate: validateForm,
    onSubmit: handleSubmit,
    validateOnBlur: true,
  });

  const handleAddAddress = () => {
    form.resetForm();
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleEditAddress = (address: SavedAddress) => {
    const formData: AddressFormData = {
      label: address.label,
      firstName: address.firstName,
      lastName: address.lastName,
      address: address.address,
      address2: address.address2 || '',
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phone: address.phone || '',
      isDefault: address.isDefault,
    };
    
    Object.keys(formData).forEach(key => {
      form.setFieldValue(key as keyof AddressFormData, formData[key as keyof AddressFormData]);
    });
    
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      } catch (error) {
        console.error('Error deleting address:', error);
      }
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      setAddresses(prev => 
        prev.map(addr => ({ ...addr, isDefault: addr.id === addressId }))
      );
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
    form.resetForm();
  };

  if (loading) {
    return (
      <AccountLayout>
        <AddressBookSkeleton />
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Address Book</h2>
            <p className="text-gray-600 mt-1">
              Manage your shipping and billing addresses
            </p>
          </div>
          <Button onClick={handleAddAddress}>
            Add New Address
          </Button>
        </div>

        {/* Addresses Grid */}
        {addresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <div key={address.id} className="bg-white rounded-lg border border-gray-200 p-6 relative">
                {/* Default Badge */}
                {address.isDefault && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                      Default
                    </span>
                  </div>
                )}

                {/* Address Label */}
                <div className="flex items-center gap-2 mb-3">
                  <LocationIcon className="w-5 h-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900">{address.label}</h3>
                </div>

                {/* Address Details */}
                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  <p className="font-medium text-gray-900">
                    {address.firstName} {address.lastName}
                  </p>
                  <p>{address.address}</p>
                  {address.address2 && <p>{address.address2}</p>}
                  <p>
                    {address.city}, {address.state} {address.zipCode}
                  </p>
                  <p>{countryOptions.find(c => c.value === address.country)?.label}</p>
                  {address.phone && (
                    <p className="flex items-center gap-2 mt-2">
                      <PhoneIcon className="w-4 h-4" />
                      {address.phone}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditAddress(address)}
                  >
                    Edit
                  </Button>
                  {!address.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(address.id)}
                    >
                      Set as Default
                    </Button>
                  )}
                  {addresses.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAddress(address.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <LocationIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
            <p className="text-gray-600 mb-6">
              Add your first address to speed up checkout
            </p>
            <Button onClick={handleAddAddress}>
              Add Address
            </Button>
          </div>
        )}

        {/* Address Form Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingAddress ? 'Edit Address' : 'Add New Address'}
          size="lg"
        >
          <form onSubmit={form.handleSubmit} className="space-y-4">
            {/* Address Label */}
            <div>
              <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-2">
                Address Label *
              </label>
              <Input
                id="label"
                value={form.values.label}
                onChange={(e) => form.handleChange('label', e.target.value)}
                onBlur={() => form.handleBlur('label')}
                error={form.touched.label ? form.errors.label : undefined}
                placeholder="e.g., Home, Office, Mom's House"
                fullWidth
              />
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <Input
                  id="firstName"
                  value={form.values.firstName}
                  onChange={(e) => form.handleChange('firstName', e.target.value)}
                  onBlur={() => form.handleBlur('firstName')}
                  error={form.touched.firstName ? form.errors.firstName : undefined}
                  fullWidth
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <Input
                  id="lastName"
                  value={form.values.lastName}
                  onChange={(e) => form.handleChange('lastName', e.target.value)}
                  onBlur={() => form.handleBlur('lastName')}
                  error={form.touched.lastName ? form.errors.lastName : undefined}
                  fullWidth
                />
              </div>
            </div>

            {/* Address Fields */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <Input
                id="address"
                value={form.values.address}
                onChange={(e) => form.handleChange('address', e.target.value)}
                onBlur={() => form.handleBlur('address')}
                error={form.touched.address ? form.errors.address : undefined}
                placeholder="123 Main Street"
                fullWidth
              />
            </div>

            <div>
              <label htmlFor="address2" className="block text-sm font-medium text-gray-700 mb-2">
                Apartment, Suite, etc. (Optional)
              </label>
              <Input
                id="address2"
                value={form.values.address2}
                onChange={(e) => form.handleChange('address2', e.target.value)}
                placeholder="Apt 4B, Suite 200, etc."
                fullWidth
              />
            </div>

            {/* City, State, ZIP */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <Input
                  id="city"
                  value={form.values.city}
                  onChange={(e) => form.handleChange('city', e.target.value)}
                  onBlur={() => form.handleBlur('city')}
                  error={form.touched.city ? form.errors.city : undefined}
                  fullWidth
                />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <Select
                  id="state"
                  options={stateOptions}
                  value={form.values.state}
                  onChange={(e) => form.handleChange('state', e.target.value)}
                  error={form.touched.state ? form.errors.state : undefined}
                  placeholder="Select state"
                  fullWidth
                />
              </div>
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code *
                </label>
                <Input
                  id="zipCode"
                  value={form.values.zipCode}
                  onChange={(e) => form.handleChange('zipCode', e.target.value)}
                  onBlur={() => form.handleBlur('zipCode')}
                  error={form.touched.zipCode ? form.errors.zipCode : undefined}
                  placeholder="10001"
                  fullWidth
                />
              </div>
            </div>

            {/* Country and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <Select
                  id="country"
                  options={countryOptions}
                  value={form.values.country}
                  onChange={(e) => form.handleChange('country', e.target.value)}
                  error={form.touched.country ? form.errors.country : undefined}
                  fullWidth
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.values.phone}
                  onChange={(e) => form.handleChange('phone', e.target.value)}
                  onBlur={() => form.handleBlur('phone')}
                  error={form.touched.phone ? form.errors.phone : undefined}
                  placeholder="(555) 123-4567"
                  fullWidth
                />
              </div>
            </div>

            {/* Default Address Checkbox */}
            <div className="flex items-center">
              <input
                id="isDefault"
                type="checkbox"
                checked={form.values.isDefault}
                onChange={(e) => form.handleChange('isDefault', e.target.checked)}
                className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
              />
              <label htmlFor="isDefault" className="ml-3 text-sm text-gray-700">
                Set as default address
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCloseModal}
                disabled={form.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={form.isSubmitting}
                disabled={!form.isValid}
              >
                {editingAddress ? 'Update Address' : 'Save Address'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AccountLayout>
  );
}

function AddressBookSkeleton(): JSX.Element {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>

      {/* Addresses Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
              <div className="h-5 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, lineIndex) => (
                <div key={lineIndex} className="h-4 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-4 border-t border-gray-100 mt-4">
              <div className="h-8 bg-gray-200 rounded w-12"></div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Icon Components
function LocationIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
