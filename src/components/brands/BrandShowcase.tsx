"use client";
import * as React from 'react';
import Link from 'next/link';
import { brandApi } from '../../lib/api';
import type { Brand } from '../../lib/types';

export default function BrandShowcase() {
  const [brands, setBrands] = React.useState<Brand[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const brandsData = await brandApi.getBrands();
        // Sort by sortOrder to maintain the correct display order
        const sortedBrands = brandsData.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        setBrands(sortedBrands);
      } catch (err) {
        console.error('Error fetching brands:', err);
        setError('Failed to load brands');
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container-herlan">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Shop by Brand
            </h2>
            <p className="text-gray-600">
              Discover your favorite beauty brands
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error || brands.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container-herlan">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Shop by Brand
            </h2>
            <p className="text-gray-600">
              Discover your favorite beauty brands
            </p>
          </div>
          <div className="text-center text-gray-500">
            <p>No brands available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="py-16 bg-gray-50">
      <div className="container-herlan">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Shop by Brand
          </h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
          {brands.map((brand) => (
            <Link
              key={brand._id}
              href={`/brands/${brand.slug}`}
              className="group"
            >
              <div className={`
                bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center 
                hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1
                ${brand.isFeatured ? 'ring-2 ring-red-200 bg-gradient-to-br from-red-50 to-rose-50' : ''}
              `}>
                <div className="w-12 h-12 mx-auto mb-3 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-xl font-bold text-gray-700">
                    {brand.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-red-700 transition-colors duration-300">
                  {brand.name}
                </h3>
                <p className="text-xs text-gray-600">
                  {brand.shortDescription || brand.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
