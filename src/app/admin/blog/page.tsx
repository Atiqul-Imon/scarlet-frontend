'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { blogApi } from '@/lib/api';
import { BlogStats, BlogPost } from '@/lib/types';
import { 
  PlusIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  DocumentTextIcon,
  TagIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function AdminBlogPage() {
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [statsData, postsData] = await Promise.all([
          blogApi.getStats(),
          blogApi.getPosts({ limit: 5, sortBy: 'newest' })
        ]);
        
        setStats(statsData);
        setRecentPosts(postsData);
      } catch (err) {
        console.error('Error fetching blog data:', err);
        setError('Failed to load blog data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600 mt-2">Manage your blog content and analytics</p>
        </div>
        <Link
          href="/admin/blog/posts/new"
          className="inline-flex items-center px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Post
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <EyeIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">{stats.publishedPosts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.draftPosts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/admin/blog/posts"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-red-700" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">All Posts</h3>
              <p className="text-gray-600">Manage all blog posts</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/blog/categories"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <TagIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
              <p className="text-gray-600">Manage blog categories</p>
            </div>
          </div>
        </Link>

        <Link
          href="/blog"
          target="_blank"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <EyeIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">View Blog</h3>
              <p className="text-gray-600">Preview public blog</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Posts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Published
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentPosts.map((post) => (
                <tr key={post._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 line-clamp-1">
                      {post.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      by {post.author.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(post.status)}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {post.viewCount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {post.publishedAt ? formatDate(post.publishedAt) : 'Not published'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/blog/posts/${post._id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this post?')) {
                            // Handle delete
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Most Popular Post */}
      {stats?.mostPopularPost && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Most Popular Post</h2>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{stats.mostPopularPost.title}</h3>
              <p className="text-gray-600">{stats.mostPopularPost.viewCount.toLocaleString()} views</p>
            </div>
            <Link
              href={`/blog/${stats.mostPopularPost.slug}`}
              target="_blank"
              className="text-red-700 hover:text-red-800 font-medium"
            >
              View Post →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
