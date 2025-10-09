"use client";

import { useState } from 'react';
import { ArrowLeft, Send, CheckCircle, AlertCircle, Mail, Phone, User, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { fetchJson } from '@/lib/api';

export default function SkincareConsultationPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!formData.email.trim() && !formData.mobile.trim()) {
      setError('Please provide either email or mobile number');
      return;
    }

    if (!formData.subject.trim()) {
      setError('Please enter a subject');
      return;
    }

    if (!formData.message.trim()) {
      setError('Please describe your skincare concern');
      return;
    }

    setLoading(true);

    try {
      await fetchJson('/consultations/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim() || undefined,
          mobile: formData.mobile.trim() || undefined,
          subject: formData.subject.trim(),
          message: formData.message.trim()
        })
      });

      setSubmitted(true);
      setFormData({ name: '', email: '', mobile: '', subject: '', message: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to submit consultation request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Thank You for Reaching Out!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Your skincare consultation request has been received. Our expert team at Scarlet will review your concern and get back to you as soon as possible.
            </p>
            <div className="bg-pink-50 border border-pink-100 rounded-xl p-6 mb-8">
              <p className="text-sm text-gray-700">
                <strong className="text-pink-600">What happens next?</strong><br />
                Our skincare specialists will carefully review your message and contact you within 24-48 hours through your provided contact details. Please keep an eye on your email/phone for our response.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                Back to Home
              </Link>
              <button
                onClick={() => setSubmitted(false)}
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-pink-600 text-pink-600 rounded-lg hover:bg-pink-50 transition-colors"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Skincare Medical Consultation
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get expert skincare advice from Scarlet&apos;s medical professionals. Share your concerns and we&apos;ll help you find the right solution for your skin.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-300 text-gray-900 placeholder-gray-400 transition-all"
                  required
                />
              </div>
            </div>

            {/* Email and Mobile */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-300 text-gray-900 placeholder-gray-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="mobile" className="block text-sm font-semibold text-gray-700 mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="+880 1XXX-XXXXXX"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-300 text-gray-900 placeholder-gray-400 transition-all"
                  />
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 -mt-2">
              Please provide at least one contact method (email or mobile) <span className="text-red-500">*</span>
            </p>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g., Acne Treatment, Dry Skin, Anti-Aging"
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-300 text-gray-900 placeholder-gray-400 transition-all"
                  required
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                Describe Your Skincare Concern <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={8}
                placeholder="Please provide detailed information about your skin concern, symptoms, duration, and any products you've tried..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-300 text-gray-900 placeholder-gray-400 transition-all resize-none"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                The more details you provide, the better we can help you
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-600 to-pink-700 text-white font-semibold py-4 px-6 rounded-lg hover:from-pink-700 hover:to-pink-800 focus:outline-none focus:ring-4 focus:ring-pink-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Submit Consultation Request
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
              Important Information
            </h3>
            <ul className="text-sm text-gray-700 space-y-1 ml-7">
              <li>• Our skincare experts will review your request within 24-48 hours</li>
              <li>• We&apos;ll contact you through your preferred method (email or mobile)</li>
              <li>• This consultation is completely FREE of charge</li>
              <li>• Your information is kept confidential and secure</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

