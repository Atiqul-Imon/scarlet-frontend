'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { blogApi } from '@/lib/api';
import { BlogPost } from '@/lib/types';
import { SectionContainer } from '@/components/layout';
import { 
  CalendarIcon, 
  ClockIcon, 
  EyeIcon, 
  ArrowLeftIcon,
  ShareIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  // Fetch blog post and related posts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [postData, relatedData] = await Promise.all([
          blogApi.getPostBySlug(slug),
          blogApi.getRelatedPosts(slug, 3)
        ]);
        
        setPost(postData);
        setRelatedPosts(relatedData);
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchData();
    }
  }, [slug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // Here you would typically send a like to the backend
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SectionContainer>
          <div className="py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
              <div className="h-64 bg-gray-300 rounded mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </SectionContainer>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SectionContainer>
          <div className="py-12 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
            <p className="text-gray-600 mb-8">{error || 'The blog post you are looking for does not exist.'}</p>
            <Link
              href="/blog"
              className="inline-flex items-center px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </div>
        </SectionContainer>
      </div>
    );
  }

  return (
    <>
      {post && (
        <Head>
          <title>{post.seoTitle || post.title} | Scarlet Beauty Blog</title>
          <meta name="description" content={post.seoDescription || post.excerpt} />
          <meta name="keywords" content={post.seoKeywords.join(', ')} />
          <meta property="og:title" content={post.seoTitle || post.title} />
          <meta property="og:description" content={post.seoDescription || post.excerpt} />
          <meta property="og:type" content="article" />
          <meta property="og:url" content={`https://scarlet.com.bd/blog/${post.slug}`} />
          {post.featuredImage && (
            <meta property="og:image" content={post.featuredImage} />
          )}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={post.seoTitle || post.title} />
          <meta name="twitter:description" content={post.seoDescription || post.excerpt} />
          {post.featuredImage && (
            <meta name="twitter:image" content={post.featuredImage} />
          )}
          <meta property="article:author" content={post.author.name || 'Anonymous'} />
          <meta property="article:published_time" content={post.publishedAt || post.createdAt!} />
          <meta property="article:section" content="Beauty" />
          {post.tags.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
          <link rel="canonical" href={`https://scarlet.com.bd/blog/${post.slug}`} />
          
          {/* JSON-LD Schema */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                "headline": post.title,
                "description": post.excerpt,
                "image": post.featuredImage,
                "author": {
                  "@type": "Person",
                  "name": post.author.name || 'Anonymous',
                  "url": post.author.socialLinks?.twitter || post.author.socialLinks?.instagram
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Scarlet",
                  "url": "https://scarlet.com.bd"
                },
                "datePublished": post.publishedAt || post.createdAt,
                "dateModified": post.updatedAt || post.createdAt,
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": `https://scarlet.com.bd/blog/${post.slug}`
                },
                "keywords": post.seoKeywords.join(', '),
                "wordCount": post.content.split(/\s+/).length,
                "timeRequired": `PT${post.readingTime}M`
              })
            }}
          />
        </Head>
      )}
      <div className="min-h-screen bg-gray-50">
        <SectionContainer>
        <div className="py-12">
          {/* Back Button */}
          <Link
            href="/blog"
            className="inline-flex items-center text-red-700 hover:text-red-800 mb-8 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>

          {/* Article Header */}
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>
            
            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2" />
                <span>{formatDate(post.publishedAt || post.createdAt!)}</span>
              </div>
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-2" />
                <span>{post.readingTime} min read</span>
              </div>
              <div className="flex items-center">
                <EyeIcon className="h-4 w-4 mr-2" />
                <span>{post.viewCount} views</span>
              </div>
            </div>

            {/* Author Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {post.author.avatar && (
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name || 'Author avatar'}
                    width={48}
                    height={48}
                    className="rounded-full mr-4"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900">{post.author.name || 'Anonymous'}</p>
                  {post.author.bio && (
                    <p className="text-sm text-gray-600">{post.author.bio}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-700 transition-colors"
                >
                  {isLiked ? (
                    <HeartSolid className="h-5 w-5 text-red-700" />
                  ) : (
                    <HeartIcon className="h-5 w-5" />
                  )}
                  <span>Like</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-700 transition-colors"
                >
                  <ShareIcon className="h-5 w-5" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="mb-12">
              <Image
                src={post.featuredImage}
                alt={post.title}
                width={800}
                height={450}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Article Content */}
          <article className="prose prose-lg max-w-none mb-12">
            <div 
              className="text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mb-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full hover:bg-red-200 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Related Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <article key={relatedPost._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    {relatedPost.featuredImage && (
                      <div className="aspect-w-16 aspect-h-9">
                        <Image
                          src={relatedPost.featuredImage}
                          alt={relatedPost.title}
                          width={400}
                          height={225}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        <Link href={`/blog/${relatedPost.slug}`} className="hover:text-red-700 transition-colors">
                          {relatedPost.title}
                        </Link>
                      </h4>
                      <p className="text-gray-600 text-sm line-clamp-2">{relatedPost.excerpt}</p>
                      <div className="flex items-center mt-3 text-xs text-gray-500">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        <span>{relatedPost.readingTime} min read</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Back to Blog */}
          <div className="text-center">
            <Link
              href="/blog"
              className="inline-flex items-center px-6 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to All Articles
            </Link>
          </div>
        </div>
      </SectionContainer>
      </div>
    </>
  );
}
