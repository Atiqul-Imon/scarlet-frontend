'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { fetchJson } from '@/lib/api';

interface FormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  age: string;
  gender: string;
  skinType: string;
  mainProblem: string;
  problemDuration: string;
  currentProducts: string;
  images: File[];
  preferredContactMethod: string;
  additionalComments: string;
}

export default function SkincareConsultationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    address: '',
    phone: '',
    email: '',
    age: '',
    gender: '',
    skinType: '',
    mainProblem: '',
    problemDuration: '',
    currentProducts: '',
    images: [],
    preferredContactMethod: 'phone',
    additionalComments: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const validate = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.name.trim()) newErrors.name = 'নাম আবশ্যক / Name is required';
    if (!formData.address.trim()) newErrors.address = 'ঠিকানা আবশ্যক / Address is required';
    if (!formData.phone.trim()) newErrors.phone = 'ফোন নম্বর আবশ্যক / Phone number is required';
    else if (!/^\+?[০-৯0-9]{10,15}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'সঠিক ফোন নম্বর দিন / Invalid phone number';
    }
    
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'সঠিক ইমেইল দিন / Invalid email address';
    }
    
    const ageNum = parseInt(formData.age);
    if (!formData.age.trim() || isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      newErrors.age = 'সঠিক বয়স দিন / Valid age is required';
    }
    
    if (!formData.skinType) newErrors.skinType = 'স্কিন টাইপ নির্বাচন করুন / Skin type is required';
    if (!formData.mainProblem.trim()) newErrors.mainProblem = 'মূল সমস্যা লিখুন / Main problem is required';
    if (!formData.problemDuration.trim()) newErrors.problemDuration = 'সমস্যার সময়কাল লিখুন / Problem duration is required';
    
    // Validate images
    if (formData.images.length > 3) {
      newErrors.images = 'সর্বোচ্চ ৩টি ছবি আপলোড করতে পারবেন / Maximum 3 images allowed';
    }
    
    for (const image of formData.images) {
      if (image.size > 1024 * 1024) { // 1MB
        newErrors.images = 'প্রতিটি ছবি ১ MB এর কম হতে হবে / Each image must be less than 1MB';
        break;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormData];
        return newErrors;
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (formData.images.length + files.length > 3) {
      setErrors((prev) => ({
        ...prev,
        images: 'সর্বোচ্চ ৩টি ছবি আপলোড করতে পারবেন / Maximum 3 images allowed'
      }));
      return;
    }
    
    // Check file sizes
    for (const file of files) {
      if (file.size > 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          images: 'প্রতিটি ছবি ১ MB এর কম হতে হবে / Each image must be less than 1MB'
        }));
        return;
      }
    }
    
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    
    if (errors.images) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.images;
        return newErrors;
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload images first
      const imageUrls: string[] = [];
      for (const image of formData.images) {
        const formDataImg = new FormData();
        formDataImg.append('file', image);
        
        const response = await fetch('/api/upload/consultation', {
          method: 'POST',
          body: formDataImg,
        });
        
        if (!response.ok) {
          throw new Error('Image upload failed');
        }
        
        const result = await response.json();
        imageUrls.push(result.url);
      }
      
      // Submit consultation
      await fetchJson('/consultations/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          address: formData.address,
          phone: formData.phone,
          email: formData.email || undefined,
          age: parseInt(formData.age),
          gender: formData.gender || undefined,
          skinType: formData.skinType,
          mainProblem: formData.mainProblem,
          problemDuration: formData.problemDuration,
          currentProducts: formData.currentProducts || undefined,
          images: imageUrls,
          preferredContactMethod: formData.preferredContactMethod,
          additionalComments: formData.additionalComments || undefined,
        }),
      });
      
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Consultation submission failed:', err);
      setSubmitError(err.message || 'Failed to submit consultation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <CheckCircleIcon className="w-24 h-24 text-green-500 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-gray-800 mb-4">ধন্যবাদ! Thank You!</h2>
          <p className="text-gray-600 mb-6 text-lg">
            আপনার স্কিনকেয়ার পরামর্শের অনুরোধ সফলভাবে জমা হয়েছে।
            <br /><br />
            Your skincare consultation request has been successfully submitted.
            Our experts will review your case and contact you within 24-48 hours.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gradient-to-r from-red-700 to-purple-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:from-red-800 hover:to-purple-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 mb-3"
          >
            হোমপেজে ফিরে যান / Return to Homepage
          </button>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setFormData({
                name: '',
                address: '',
                phone: '',
                email: '',
                age: '',
                gender: '',
                skinType: '',
                mainProblem: '',
                problemDuration: '',
                currentProducts: '',
                images: [],
                preferredContactMethod: 'phone',
                additionalComments: '',
              });
              setImagePreviews([]);
              setErrors({});
            }}
            className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg text-lg font-semibold hover:bg-gray-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            আরেকটি অনুরোধ পাঠান / Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-700 to-purple-600 mb-4 text-center">
            স্কিনকেয়ার পরামর্শ নিন
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
            Get Your Skin Care Suggestion
          </h2>
          <p className="text-gray-700 text-lg mb-8 text-center max-w-2xl mx-auto">
            আপনার ত্বকের সমস্যা সমাধানে আমাদের বিশেষজ্ঞদের পরামর্শ পান
            <br />
            Get personalized skincare advice from our medical professionals
          </p>


          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                নাম / Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white text-gray-900 placeholder-gray-400`}
                required
              />
              {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                ঠিকানা / Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white text-gray-900 placeholder-gray-400`}
                required
              />
              {errors.address && <p className="mt-2 text-sm text-red-600">{errors.address}</p>}
            </div>

            {/* Phone and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  ফোন নম্বর / Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white text-gray-900 placeholder-gray-400`}
                  required
                />
                {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  ইমেইল / Email Address <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white text-gray-900 placeholder-gray-400`}
                />
                {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
              </div>
            </div>

            {/* Age and Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="age" className="block text-sm font-semibold text-gray-700 mb-2">
                  বয়স / Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="1"
                  max="120"
                  className={`w-full px-4 py-3 border-2 ${errors.age ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white text-gray-900 placeholder-gray-400`}
                  required
                />
                {errors.age && <p className="mt-2 text-sm text-red-600">{errors.age}</p>}
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-2">
                  লিঙ্গ / Gender <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white text-gray-900"
                >
                  <option value="">নির্বাচন করুন / Select</option>
                  <option value="male">পুরুষ / Male</option>
                  <option value="female">মহিলা / Female</option>
                  <option value="other">অন্যান্য / Other</option>
                </select>
              </div>
            </div>

            {/* Skin Type */}
            <div>
              <label htmlFor="skinType" className="block text-sm font-semibold text-gray-700 mb-2">
                ত্বকের ধরন / Skin Type <span className="text-red-500">*</span>
              </label>
              <select
                id="skinType"
                name="skinType"
                value={formData.skinType}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 ${errors.skinType ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white text-gray-900`}
                required
              >
                <option value="">নির্বাচন করুন / Select</option>
                <option value="oily">তৈলাক্ত / Oily</option>
                <option value="dry">শুষ্ক / Dry</option>
                <option value="normal">স্বাভাবিক / Normal</option>
                <option value="combination">মিশ্র / Combination</option>
                <option value="sensitive">সংবেদনশীল / Sensitive</option>
              </select>
              {errors.skinType && <p className="mt-2 text-sm text-red-600">{errors.skinType}</p>}
            </div>

            {/* Main Problem */}
            <div>
              <label htmlFor="mainProblem" className="block text-sm font-semibold text-gray-700 mb-2">
                মূল ত্বকের সমস্যা / Main Skin Problem <span className="text-red-500">*</span>
              </label>
              <textarea
                id="mainProblem"
                name="mainProblem"
                rows={3}
                value={formData.mainProblem}
                onChange={handleChange}
                placeholder="যেমন: ব্রণ, কালো দাগ, ত্বক নিস্তেজ, সংবেদনশীল / E.g., Acne, Pigmentation, Dullness, Sensitivity"
                className={`w-full px-4 py-3 border-2 ${errors.mainProblem ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white text-gray-900 placeholder-gray-400`}
                required
              ></textarea>
              {errors.mainProblem && <p className="mt-2 text-sm text-red-600">{errors.mainProblem}</p>}
            </div>

            {/* Problem Duration */}
            <div>
              <label htmlFor="problemDuration" className="block text-sm font-semibold text-gray-700 mb-2">
                সমস্যাটা কতোদিন ধরে আছে / How Long You've Had This Problem <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="problemDuration"
                name="problemDuration"
                value={formData.problemDuration}
                onChange={handleChange}
                placeholder="যেমন: ৬ মাস, ২ বছর / E.g., 6 months, 2 years"
                className={`w-full px-4 py-3 border-2 ${errors.problemDuration ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white text-gray-900 placeholder-gray-400`}
                required
              />
              {errors.problemDuration && <p className="mt-2 text-sm text-red-600">{errors.problemDuration}</p>}
            </div>

            {/* Current Products */}
            <div>
              <label htmlFor="currentProducts" className="block text-sm font-semibold text-gray-700 mb-2">
                বর্তমানে ব্যবহৃত পণ্য / Products You Currently Use <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <textarea
                id="currentProducts"
                name="currentProducts"
                rows={3}
                value={formData.currentProducts}
                onChange={handleChange}
                placeholder="আপনি বর্তমানে যে পণ্যগুলো ব্যবহার করছেন তা উল্লেখ করুন / List products you're currently using"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white text-gray-900 placeholder-gray-400"
              ></textarea>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ছবি আপলোড করুন / Upload Photos <span className="text-gray-400 text-xs">(Optional, Max 3, 1MB each)</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                <input
                  type="file"
                  id="images"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={formData.images.length >= 3}
                />
                <label
                  htmlFor="images"
                  className={`cursor-pointer ${formData.images.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <PhotoIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">
                    {formData.images.length >= 3
                      ? 'সর্বোচ্চ ৩টি ছবি আপলোড করা হয়েছে / Maximum 3 images uploaded'
                      : 'ছবি আপলোড করতে ক্লিক করুন / Click to upload images'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG (Max 1MB each)</p>
                </label>
              </div>
              {errors.images && <p className="mt-2 text-sm text-red-600">{errors.images}</p>}
              
              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Preferred Contact Method */}
            <div>
              <label htmlFor="preferredContactMethod" className="block text-sm font-semibold text-gray-700 mb-2">
                যোগাযোগের পছন্দের মাধ্যম / Preferred Contact Method <span className="text-red-500">*</span>
              </label>
              <select
                id="preferredContactMethod"
                name="preferredContactMethod"
                value={formData.preferredContactMethod}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white text-gray-900"
                required
              >
                <option value="phone">ফোন / Phone</option>
                <option value="email">ইমেইল / Email</option>
                <option value="whatsapp">হোয়াটসঅ্যাপ / WhatsApp</option>
              </select>
            </div>

            {/* Additional Comments */}
            <div>
              <label htmlFor="additionalComments" className="block text-sm font-semibold text-gray-700 mb-2">
                অতিরিক্ত মন্তব্য / Additional Comments <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <textarea
                id="additionalComments"
                name="additionalComments"
                rows={4}
                value={formData.additionalComments}
                onChange={handleChange}
                placeholder="অন্য কোনো তথ্য যা আমাদের জানা প্রয়োজন / Any other information we should know"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white text-gray-900 placeholder-gray-400"
              ></textarea>
            </div>

            {submitError && (
              <div className="bg-red-50 border-l-4 border-red-400 text-red-800 p-4 rounded-lg flex items-center space-x-3">
                <ExclamationCircleIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
                <p className="text-sm font-medium">{submitError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-lg shadow-lg text-lg font-bold text-white bg-gradient-to-r from-red-700 to-purple-600 hover:from-red-800 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  জমা হচ্ছে... / Submitting...
                </>
              ) : (
                'পরামর্শ পাঠান / Submit Consultation'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
