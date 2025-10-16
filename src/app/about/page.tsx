import React from 'react';
import { 
  HeartIcon, 
  SparklesIcon, 
  UserGroupIcon, 
  GlobeAltIcon,
  ShieldCheckIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-50 via-purple-50 to-blue-50 py-20">
        <div className="container-herlan">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              About <span className="text-red-700">Scarlet</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              We're passionate about bringing you the finest beauty and skincare products 
              from around the world, right to your doorstep.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container-herlan">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    Founded in 2024, Scarlet was born from a simple belief: everyone deserves 
                    access to high-quality beauty products that make them feel confident and beautiful. 
                    What started as a small passion project has grown into Bangladesh's premier 
                    beauty destination.
                  </p>
                  <p>
                    We carefully curate products from trusted international brands and emerging 
                    beauty innovators, ensuring that every item in our collection meets our 
                    strict standards for quality, safety, and effectiveness.
                  </p>
                  <p>
                    Our team of beauty experts is constantly researching and testing new products 
                    to bring you the latest trends and timeless classics that truly work.
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-100 to-purple-100 rounded-2xl p-8 text-center">
                <div className="text-6xl mb-4">💄</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-600">
                  To empower everyone to express their unique beauty through 
                  carefully curated, high-quality products and expert guidance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-gray-50">
        <div className="container-herlan">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These core principles guide everything we do at Scarlet
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <HeartIcon className="w-8 h-8 text-red-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quality First</h3>
              <p className="text-gray-600">
                We never compromise on quality. Every product is carefully selected 
                and tested to ensure it meets our high standards.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <SparklesIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Innovation</h3>
              <p className="text-gray-600">
                We stay ahead of beauty trends and continuously explore new 
                products and technologies to serve you better.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserGroupIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Community</h3>
              <p className="text-gray-600">
                We believe in building a supportive community where everyone 
                can share their beauty journey and learn from each other.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <GlobeAltIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Sustainability</h3>
              <p className="text-gray-600">
                We're committed to sustainable beauty practices and supporting 
                brands that care for our planet.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheckIcon className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Trust</h3>
              <p className="text-gray-600">
                Transparency and honesty are at the heart of everything we do. 
                We provide honest reviews and recommendations.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <TruckIcon className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Accessibility</h3>
              <p className="text-gray-600">
                We make premium beauty products accessible to everyone, 
                regardless of location or budget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container-herlan">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Passionate beauty experts dedicated to helping you look and feel your best
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-red-200 to-purple-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-4xl">👩‍💼</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sarah Ahmed</h3>
              <p className="text-red-700 font-medium mb-2">Founder & CEO</p>
              <p className="text-gray-600 text-sm">
                Beauty industry veteran with 10+ years of experience in 
                product development and brand partnerships.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-200 to-green-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-4xl">👨‍🔬</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Dr. Fatima Rahman</h3>
              <p className="text-red-700 font-medium mb-2">Chief Beauty Scientist</p>
              <p className="text-gray-600 text-sm">
                Dermatologist and cosmetic chemist ensuring all our products 
                are safe, effective, and scientifically backed.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-4xl">👩‍🎨</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aisha Khan</h3>
              <p className="text-red-700 font-medium mb-2">Creative Director</p>
              <p className="text-gray-600 text-sm">
                Makeup artist and content creator bringing fresh perspectives 
                and trend insights to our community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-red-700 to-purple-600 text-white">
        <div className="container-herlan">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-red-200">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-red-200">Products</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-red-200">Brands</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-red-200">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-herlan">
          <div className="bg-gradient-to-r from-red-50 to-purple-50 rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Ready to Start Your Beauty Journey?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of beauty enthusiasts who trust Scarlet for their 
              skincare and makeup needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/products" 
                className="px-8 py-4 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors font-medium"
              >
                Shop Now
              </a>
              <a 
                href="/contact" 
                className="px-8 py-4 border-2 border-red-700 text-red-700 rounded-lg hover:bg-red-700 hover:text-white transition-colors font-medium"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
