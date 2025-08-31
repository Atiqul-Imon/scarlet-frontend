"use client";
import * as React from 'react';
import Link from 'next/link';

export default function PromotionalBanner() {
  return (
    <section className="py-6 bg-gradient-to-r from-pink-500 to-purple-600">
      <div className="container-herlan">
        <div className="text-center text-white">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
            ✨ Flat 30% Off ✨
          </h2>
          <p className="text-pink-100 mb-4 text-sm md:text-base">
            On all skincare and makeup products
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/products?discount=30"
              className="bg-white text-pink-600 px-6 py-3 rounded-full font-semibold hover:bg-pink-50 transition-colors duration-300"
            >
              Shop Now
            </Link>
            <p className="text-pink-100 text-sm">
              Use code: <span className="font-bold text-white">BEAUTY30</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
