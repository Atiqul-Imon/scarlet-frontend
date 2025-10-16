import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Special Offers | Scarlet Deals',
  description: 'Discover amazing deals, discounts, and special offers on beauty products. Limited time offers and exclusive promotions.',
};

export default function OffersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-herlan py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Special Offers
            </h1>
            <p className="text-xl text-gray-600">
              Discover amazing deals and exclusive promotions
            </p>
          </div>

          {/* Featured Offer */}
          <div className="bg-gradient-to-r from-red-500 to-rose-500 rounded-lg shadow-lg p-8 mb-12 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-2/3 mb-6 md:mb-0">
                <h2 className="text-3xl font-bold mb-4">
                  🎉 New Year Special!
                </h2>
                <p className="text-lg mb-4">
                  Get 30% off on all beauty products. Limited time offer!
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded-full">
                    Valid till Jan 31, 2025
                  </span>
                  <span className="bg-white/20 px-3 py-1 rounded-full">
                    Code: NEWYEAR30
                  </span>
                </div>
              </div>
              <div className="md:w-1/3 text-center md:text-right">
                <div className="text-4xl font-bold mb-2">30% OFF</div>
                <button className="bg-white text-red-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Shop Now
                </button>
              </div>
            </div>
          </div>

          {/* Current Offers Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-red-100 p-6 text-center">
                <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Buy 2 Get 1 Free</h3>
                <p className="text-gray-600 text-sm mb-4">On all skincare products</p>
                <button className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-colors">
                  Shop Skincare
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-purple-100 p-6 text-center">
                <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Free Shipping</h3>
                <p className="text-gray-600 text-sm mb-4">On orders over ৳2,000</p>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Shop Now
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-green-100 p-6 text-center">
                <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">First Order 20% Off</h3>
                <p className="text-gray-600 text-sm mb-4">New customer exclusive</p>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Get Started
                </button>
              </div>
            </div>
          </div>

          {/* Coming Soon Offers */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              Coming Soon
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Flash Sale</h3>
                    <p className="text-sm text-gray-600">Limited time 50% off</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Get ready for our biggest flash sale of the year with up to 50% off on selected items.
                </p>
                <div className="text-xs text-orange-600 font-medium">
                  Coming February 2025
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Referral Program</h3>
                    <p className="text-sm text-gray-600">Earn rewards for referrals</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Refer friends and earn points for every successful referral. Both you and your friend get rewards!
                </p>
                <div className="text-xs text-blue-600 font-medium">
                  Coming March 2025
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="mt-12 bg-gradient-to-r from-red-500 to-rose-500 rounded-lg shadow-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">
              Don't Miss Out on Exclusive Offers!
            </h2>
            <p className="text-lg mb-6">
              Subscribe to our newsletter and be the first to know about new deals and promotions.
            </p>
            <div className="max-w-md mx-auto flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-l-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="bg-white text-red-700 px-6 py-3 rounded-r-lg font-semibold hover:bg-gray-100 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
