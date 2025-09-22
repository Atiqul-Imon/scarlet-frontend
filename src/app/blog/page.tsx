'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { blogApi } from '@/lib/api';
import { BlogPost, BlogCategory, BlogQuery } from '@/lib/types';
import { SectionContainer } from '@/components/layout';
import { MagnifyingGlassIcon, CalendarIcon, ClockIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<BlogQuery>({
    page: 1,
    limit: 12,
    sortBy: 'newest'
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch blog posts and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [postsData, categoriesData] = await Promise.all([
          blogApi.getPosts(query),
          blogApi.getCategories()
        ]);
        
        setPosts(postsData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching blog data:', err);
        setError('Failed to load blog posts');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(prev => ({
      ...prev,
      search: searchTerm,
      page: 1
    }));
  };

  const handleCategoryFilter = (categorySlug: string) => {
    setQuery(prev => ({
      ...prev,
      category: categorySlug === prev.category ? '' : categorySlug,
      page: 1
    }));
  };

  const handleSortChange = (sortBy: 'newest' | 'oldest' | 'popular' | 'title') => {
    setQuery(prev => ({
      ...prev,
      sortBy,
      page: 1
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SectionContainer>
          <div className="py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/3 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="h-48 bg-gray-300"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2 mb-4"></div>
                      <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionContainer>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SectionContainer>
          <div className="py-12 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog</h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </SectionContainer>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Beauty Blog - Latest Tips, Reviews & Skincare Secrets | Scarlet</title>
        <meta name="description" content="Discover the latest beauty tips, product reviews, and skincare secrets from our experts. Stay updated with trending beauty topics and expert advice." />
        <meta name="keywords" content="beauty blog, skincare tips, makeup reviews, beauty advice, skincare routine, beauty trends" />
        <meta property="og:title" content="Beauty Blog - Latest Tips, Reviews & Skincare Secrets | Scarlet" />
        <meta property="og:description" content="Discover the latest beauty tips, product reviews, and skincare secrets from our experts. Stay updated with trending beauty topics and expert advice." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://scarlet.com.bd/blog" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Beauty Blog - Latest Tips, Reviews & Skincare Secrets | Scarlet" />
        <meta name="twitter:description" content="Discover the latest beauty tips, product reviews, and skincare secrets from our experts. Stay updated with trending beauty topics and expert advice." />
        <link rel="canonical" href="https://scarlet.com.bd/blog" />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <SectionContainer>
        <div className="py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Beauty Blog</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the latest beauty tips, product reviews, and skincare secrets from our experts
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="Search blog posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </form>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <button
                onClick={() => handleCategoryFilter('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !query.category
                    ? 'bg-pink-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => handleCategoryFilter(category.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    query.category === category.slug
                      ? 'bg-pink-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Sort Options */}
            <div className="flex justify-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              {[
                { value: 'newest', label: 'Newest' },
                { value: 'oldest', label: 'Oldest' },
                { value: 'popular', label: 'Most Popular' },
                { value: 'title', label: 'Title' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value as any)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    query.sortBy === option.value
                      ? 'bg-pink-100 text-pink-700'
                      : 'text-gray-600 hover:text-pink-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Blog Posts Grid */}
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts found</h3>
              <p className="text-gray-600">
                {query.search ? 'Try adjusting your search terms' : 'Check back later for new content'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article key={post._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  {/* Featured Image */}
                  {post.featuredImage && (
                    <div className="aspect-w-16 aspect-h-9">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        width={400}
                        height={225}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    {/* Meta Info */}
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      <span>{formatDate(post.publishedAt || post.createdAt!)}</span>
                      <ClockIcon className="h-4 w-4 ml-4 mr-1" />
                      <span>{post.readingTime} min read</span>
                      <EyeIcon className="h-4 w-4 ml-4 mr-1" />
                      <span>{post.viewCount} views</span>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                      <Link href={`/blog/${post.slug}`} className="hover:text-pink-600 transition-colors">
                        {post.title}
                      </Link>
                    </h2>

                    {/* Excerpt */}
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>

                    {/* Author */}
                    <div className="flex items-center">
                      {post.author.avatar && (
                        <Image
                          src={post.author.avatar}
                          alt={post.author.name || 'Author avatar'}
                          width={32}
                          height={32}
                          className="rounded-full mr-3"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{post.author.name || 'Anonymous'}</p>
                        {post.author.bio && (
                          <p className="text-xs text-gray-500">{post.author.bio}</p>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </SectionContainer>
      </div>
    </>
  );
}
