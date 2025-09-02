"use client";
import * as React from 'react';
import Link from 'next/link';
import { categoryApi, productApi } from '../../lib/api';
import type { Category } from '../../lib/types';

interface CategoryItem extends Category {
  gradient?: string;
  productCount?: number;
  isPopular?: boolean;
  hasDiscount?: boolean;
  animationDelay: number;
  icon?: string;
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

// Smart icon assignment based on category type
const getIconForCategory = (categoryName: string): string => {
  const iconMap: Record<string, string> = {
    'skincare': '🌿',
    'skin care': '🌿',
    'makeup': '💄',
    'make up': '💄',
    'hair care': '💇‍♀️',
    'body care': '🧴',
    'cleansers': '🧼',
    'moisturizers': '💧',
    'serums': '🧪',
    'sunscreen': '☀️',
    'foundation': '🎨',
    'lipstick': '💋',
    'eye makeup': '👁️',
    'shampoo': '🧴',
    'bath & body care': '🛁',
    'bath body': '🛁',
    'accessories': '✨',
    'fragrance': '🌸',
    'tools': '🔧'
  };

  return iconMap[categoryName.toLowerCase()] || '🌟';
};

// Smart priority calculation
const calculateCategoryPriority = (category: Category): number => {
  let priority = 0;
  
  // Higher priority for main categories
  if (!category.parentId) priority += 10;
  
  // Higher priority for active categories
  if (category.isActive) priority += 5;
  
  return priority;
};

export default function CategoryGrid() {
  const [categories, setCategories] = React.useState<CategoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [, setError] = React.useState<string | null>(null);

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
          .filter(cat => cat.isActive)
          .sort((a, b) => calculateCategoryPriority(b) - calculateCategoryPriority(a))
          .slice(0, 8); // Show 8 categories
        
        // Enhance categories with smart data
        const enhancedCategories = await Promise.all(
          filteredCategories.map(async (cat, index) => {
            // Count products in this category
            const productCount = allProducts.filter(product => 
              product.categoryIds?.some((id: string) => id === cat._id)
            ).length;
            
            // Check if category has discounted products
            const hasDiscount = allProducts.some(product => 
              product.categoryIds?.some((id: string) => id === cat._id) && 
              product.price?.discountPercentage && product.price.discountPercentage > 0
            );
            
            // Determine popularity (categories with more products are more popular)
            const isPopular = productCount > 2;
            
            return {
              ...cat,
              gradient: getSmartGradient(cat.name, index) || 'from-gray-400 to-gray-500',
              productCount,
              isPopular,
              hasDiscount,
              animationDelay: index * 100, // Staggered animation
              icon: getIconForCategory(cat.name)
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
            gradient: getSmartGradient("Skincare", 0) || 'from-gray-400 to-gray-500',
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
            gradient: getSmartGradient("Makeup", 1) || 'from-gray-400 to-gray-500',
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
            gradient: getSmartGradient("Hair Care", 2) || 'from-gray-400 to-gray-500',
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
            gradient: getSmartGradient("Body Care", 3) || 'from-gray-400 to-gray-500',
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
            <div key={i} className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 bg-gray-200 rounded-full animate-pulse shadow-lg mx-auto flex items-center justify-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded animate-pulse"></div>
              </div>
              <div className="mt-3">
                <div className="w-12 sm:w-16 h-3 bg-gray-200 rounded animate-pulse mx-auto"></div>
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
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/products?category=${category.slug}`}
              className="group block transform transition-all duration-500 hover:-translate-y-2"
              style={{ 
                animationDelay: `${category.animationDelay}ms`,
                animation: `fadeInUp 0.6s ease-out forwards ${category.animationDelay}ms`
              }}
            >
              <div className="text-center">



                {/* Main Category Circle - Gray Background with Icon Only */}
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 bg-gray-100 hover:bg-gray-200 rounded-full overflow-hidden transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl shadow-lg flex items-center justify-center">
                  
                  {/* Category Icon Only */}
                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl transform transition-transform duration-300 group-hover:scale-110">
                    {category.icon || "🌟"}
                  </div>


                </div>

                {/* Category Name Below Box */}
                <div className="mt-3 text-center">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-700 leading-tight">
                    {category.name}
                  </h3>
                </div>


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