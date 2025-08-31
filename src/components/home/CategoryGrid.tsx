"use client";
import * as React from 'react';
import Link from 'next/link';
import { categoryApi, productApi } from '../../lib/api';
import type { Category } from '../../lib/types';

interface CategoryItem extends Category {
  gradient: string;
  productCount?: number;
  isPopular?: boolean;
  hasDiscount?: boolean;
  animationDelay: number;
}

// Smart gradient assignment based on category type
const getSmartGradient = (categoryName: string, index: number) => {
  const gradientMap: Record<string, string> = {
    'skincare': 'from-green-400 to-emerald-500',
    'makeup': 'from-pink-400 to-rose-500',
    'hair care': 'from-purple-400 to-violet-500',
    'body care': 'from-blue-400 to-cyan-500',
    'cleansers': 'from-teal-400 to-green-500',
    'moisturizers': 'from-cyan-400 to-blue-500',
    'serums': 'from-amber-400 to-orange-500',
    'sunscreen': 'from-yellow-400 to-orange-500',
    'foundation': 'from-rose-400 to-pink-500',
    'lipstick': 'from-red-400 to-rose-500',
    'eye makeup': 'from-indigo-400 to-purple-500',
    'shampoo': 'from-violet-400 to-purple-500'
  };

  const fallbackGradients = [
    "from-emerald-400 to-teal-500",
    "from-fuchsia-400 to-pink-500",
    "from-violet-400 to-purple-500",
    "from-sky-400 to-blue-500",
    "from-orange-400 to-red-500",
    "from-lime-400 to-green-500"
  ];

  return gradientMap[categoryName.toLowerCase()] || fallbackGradients[index % fallbackGradients.length];
};

// Smart priority calculation
const calculateCategoryPriority = (category: Category): number => {
  let priority = 0;
  
  // Higher priority for main categories
  if (!category.parentCategory) priority += 10;
  
  // Higher priority for active categories
  if (category.isActive) priority += 5;
  
  // Sort order influence
  priority += (20 - (category.sortOrder || 0));
  
  return priority;
};

export default function CategoryGrid() {
  const [categories, setCategories] = React.useState<CategoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch categories and product counts in parallel
        const [categoriesResponse, productsResponse] = await Promise.all([
          categoryApi.getCategories(),
          productApi.getProducts({ limit: 1000 }) // Get all products to count
        ]);
        
        const mainCategories = Array.isArray(categoriesResponse) ? categoriesResponse : [];
        const allProducts = Array.isArray(productsResponse) ? productsResponse : [];
        
        // Smart filtering and sorting - prioritize 8 categories
        const filteredCategories = mainCategories
          .filter(cat => cat.isActive && cat.showInHomepage)
          .sort((a, b) => calculateCategoryPriority(b) - calculateCategoryPriority(a))
          .slice(0, 8); // Show 8 categories marked for homepage
        
        // Enhance categories with smart data
        const enhancedCategories = await Promise.all(
          filteredCategories.map(async (cat, index) => {
            // Count products in this category
            const productCount = allProducts.filter(product => 
              product.categoryIds?.some(id => id === cat._id)
            ).length;
            
            // Check if category has discounted products
            const hasDiscount = allProducts.some(product => 
              product.categoryIds?.some(id => id === cat._id) && 
              product.price?.discountPercentage && product.price.discountPercentage > 0
            );
            
            // Determine popularity (categories with more products are more popular)
            const isPopular = productCount > 2;
            
            return {
              ...cat,
              gradient: getSmartGradient(cat.name, index),
              productCount,
              isPopular,
              hasDiscount,
              animationDelay: index * 100 // Staggered animation
            };
          })
        );
        
        setCategories(enhancedCategories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
        
        // Smart fallback with enhanced data
        const fallbackCategories = [
          {
            _id: 'skincare',
            name: "Skincare",
            slug: "skincare",
            description: "Complete skincare solutions",
            isActive: true,
            gradient: getSmartGradient("Skincare", 0),
            icon: "🌿",
            productCount: 8,
            isPopular: true,
            hasDiscount: true,
            animationDelay: 0
          },
          {
            _id: 'makeup',
            name: "Makeup",
            slug: "makeup",
            description: "Premium makeup products",
            isActive: true,
            gradient: getSmartGradient("Makeup", 1),
            icon: "💄",
            productCount: 6,
            isPopular: true,
            hasDiscount: false,
            animationDelay: 100
          },
          {
            _id: 'hair-care',
            name: "Hair Care",
            slug: "hair-care",
            description: "Professional hair care",
            isActive: true,
            gradient: getSmartGradient("Hair Care", 2),
            icon: "💇‍♀️",
            productCount: 4,
            isPopular: false,
            hasDiscount: true,
            animationDelay: 200
          },
          {
            _id: 'body-care',
            name: "Body Care",
            slug: "body-care",
            description: "Luxurious body care",
            isActive: true,
            gradient: getSmartGradient("Body Care", 3),
            icon: "🧴",
            productCount: 3,
            isPopular: false,
            hasDiscount: false,
            animationDelay: 300
          }
        ];
        
        setCategories(fallbackCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container-herlan">

                  <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-8 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full animate-pulse shadow-lg mx-auto"></div>
              <div className="absolute -bottom-1 sm:-bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="bg-gray-200 rounded-lg px-2 py-1 animate-pulse">
                  <div className="w-8 sm:w-12 h-2 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container-herlan">


        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-8 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <Link
              key={category._id}
              href={`/products?category=${category.slug}`}
              className="group block transform transition-all duration-500 hover:-translate-y-2"
              style={{ 
                animationDelay: `${category.animationDelay}ms`,
                animation: `fadeInUp 0.6s ease-out forwards ${category.animationDelay}ms`
              }}
            >
              <div className="relative">
                {/* Smart Badges - Responsive */}
                {category.isPopular && (
                  <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 z-30 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-1 sm:px-2 py-0.5 sm:py-1 rounded-full shadow-lg transform rotate-12 animate-pulse">
                    <span className="hidden sm:inline">🔥 Hot</span>
                    <span className="sm:hidden">🔥</span>
                  </div>
                )}
                
                {category.hasDiscount && !category.isPopular && (
                  <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 z-30 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-1 sm:px-2 py-0.5 sm:py-1 rounded-full shadow-lg transform -rotate-12">
                    <span className="hidden sm:inline">💰 Sale</span>
                    <span className="sm:hidden">💰</span>
                  </div>
                )}

                {/* Product Count Badge - Responsive */}
                {category.productCount && category.productCount > 0 && (
                  <div className="absolute -top-0.5 sm:-top-1 -left-0.5 sm:-left-1 z-30 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shadow-lg border border-gray-200">
                    <span className="text-xs sm:text-xs">
                      {category.productCount > 99 ? '99+' : category.productCount}
                    </span>
                  </div>
                )}

                {/* Main Category Circle - Compact with Better Padding */}
                <div className={`relative w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 bg-gradient-to-br ${category.gradient} rounded-full overflow-hidden transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl shadow-lg p-3 sm:p-4 md:p-5 flex flex-col justify-center items-center ${category.isPopular ? 'ring-1 ring-yellow-400 ring-opacity-50' : ''}`}>
                  
                  {/* Smart Pattern Overlay */}
                  <div className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${category.hasDiscount ? 'bg-red-500/10' : 'bg-white/10'}`}></div>
                  
                  {/* Dynamic Glow Effect */}
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-white/20 via-transparent to-transparent ${category.isPopular ? 'opacity-80' : 'opacity-60'}`}></div>
                  
                  {/* Category Icon with Smart Animation - Compact */}
                  <div className={`relative z-10 text-sm sm:text-base md:text-lg mb-1 transform transition-transform duration-500 group-hover:scale-110 ${category.isPopular ? 'group-hover:rotate-12' : 'group-hover:rotate-6'}`}>
                    {category.icon || "🌟"}
                  </div>
                  
                  {/* Category Name with Smart Styling - Compact */}
                  <div className="relative z-10 text-center">
                    <h3 className={`font-semibold text-white text-xs leading-tight tracking-wide drop-shadow-lg ${category.isPopular ? 'animate-pulse' : ''}`}>
                      <span className="hidden sm:inline">{category.name}</span>
                      <span className="sm:hidden">{category.name.split(' ')[0]}</span>
                    </h3>
                  </div>

                  {/* Smart Floating Sparkles */}
                  <div className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-700 transform group-hover:scale-125 ${category.isPopular ? 'text-yellow-300' : ''}`}>
                    <div className={`w-1 h-1 ${category.isPopular ? 'bg-yellow-300' : 'bg-white'} rounded-full animate-pulse`}></div>
                  </div>
                  <div className={`absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100 transform group-hover:scale-125 ${category.hasDiscount ? 'text-red-300' : ''}`}>
                    <div className={`w-1.5 h-1.5 ${category.hasDiscount ? 'bg-red-300' : 'bg-white'} rounded-full animate-pulse`}></div>
                  </div>
                  <div className="absolute top-1/3 left-2 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-200 transform group-hover:scale-125">
                    <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>

                {/* Smart Floating Description Card - Adjusted for smaller boxes */}
                <div className="absolute -bottom-1 sm:-bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:translate-y-1 z-20">
                  <div className={`bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 py-1 sm:px-3 sm:py-2 shadow-lg sm:shadow-xl border ${category.isPopular ? 'border-yellow-200' : category.hasDiscount ? 'border-red-200' : 'border-white/20'}`}>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <p className="text-gray-700 text-xs font-medium text-center whitespace-nowrap">
                        <span className="sm:hidden">
                          {category.description && category.description.length > 15
                            ? `${category.description.substring(0, 15)}...`
                            : category.description
                          }
                        </span>
                        <span className="hidden sm:inline">
                          {category.description && category.description.length > 20
                            ? `${category.description.substring(0, 20)}...`
                            : category.description
                          }
                        </span>
                      </p>
                      {category.productCount && category.productCount > 0 && (
                        <span className="text-gray-500 text-xs hidden sm:inline">
                          ({category.productCount})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Smart Ripple Effect */}
                <div className={`absolute inset-0 rounded-full scale-0 group-hover:scale-110 transition-transform duration-700 ease-out opacity-0 group-hover:opacity-100 ${category.isPopular ? 'bg-yellow-400/20' : category.hasDiscount ? 'bg-red-400/20' : 'bg-white/20'}`}></div>
              </div>
            </Link>
          ))}
        </div>

        {/* Smart CSS for animations */}
        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>

        {/* View All Categories Link */}
        <div className="text-center mt-12">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-semibold transition-colors duration-300"
          >
            View All Categories
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}