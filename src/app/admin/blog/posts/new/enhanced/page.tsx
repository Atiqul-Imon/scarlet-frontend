'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { blogApi } from '@/lib/api';
import { BlogCategory } from '@/lib/types';
import SimpleRichTextEditor from '@/components/editor/SimpleRichTextEditor';
import { useAutoSave } from '@/hooks/useAutoSave';
import { parseApiError, getFieldDisplayName } from '@/lib/admin-error-utils';
import { 
  ArrowLeftIcon, 
  EyeIcon, 
  CloudArrowUpIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import logger from '@/lib/logger';

export default function EnhancedNewBlogPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    author: {
      name: '',
      email: '',
      avatar: '',
      bio: ''
    },
    categories: [] as string[],
    tags: [] as string[],
    status: 'draft' as 'draft' | 'published' | 'archived',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: [] as string[],
    isFeatured: false,
    isPinned: false
  });
  const [tagInput, setTagInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [technicalDetails, setTechnicalDetails] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await blogApi.getCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // Auto-save functionality
  const { save: _autoSave } = useAutoSave({
    data: formData,
    onSave: async (data) => {
      if (!data.title || !data.content) return;
      
      try {
        setSaving(true);
        // Create or update draft
        const draftData = {
          ...data,
          status: 'draft',
          title: data.title || 'Untitled Draft',
          content: data.content || ''
        };
        
        // For now, we'll just log the auto-save
        // In a real implementation, you'd save to a drafts API
        logger.info('Auto-saving draft', { hasTitle: !!draftData.title });
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setSaving(false);
      }
    },
    interval: 30000, // 30 seconds
    enabled: hasUnsavedChanges && formData.title.length > 0
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
      seoTitle: title
    }));
    setHasUnsavedChanges(true);
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content,
      excerpt: extractExcerpt(content)
    }));
    setHasUnsavedChanges(true);
  };

  const extractExcerpt = (html: string) => {
    // Remove HTML tags and get first 200 characters
    const text = html.replace(/<[^>]*>/g, '');
    return text.substring(0, 200) + (text.length > 200 ? '...' : '');
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
      setHasUnsavedChanges(true);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
    setHasUnsavedChanges(true);
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.seoKeywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        seoKeywords: [...prev.seoKeywords, keywordInput.trim()]
      }));
      setKeywordInput('');
      setHasUnsavedChanges(true);
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      seoKeywords: prev.seoKeywords.filter(keyword => keyword !== keywordToRemove)
    }));
    setHasUnsavedChanges(true);
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    // In a real implementation, you'd upload to your image service
    // For now, we'll create a data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setFormErrors({});
    setGeneralError(null);
    setTechnicalDetails(undefined);
    
    // Client-side validation
    const clientErrors: Record<string, string> = {};
    if (!formData.title || formData.title.trim().length === 0) {
      clientErrors['title'] = 'Please enter a title for your blog post';
    }
    if (!formData.content || formData.content.trim().length === 0) {
      clientErrors['content'] = 'Please add content to your blog post';
    }
    if (!formData.slug || formData.slug.trim().length === 0) {
      clientErrors['slug'] = 'A URL slug is required for your blog post';
    }
    if (!formData.author.name || formData.author.name.trim().length === 0) {
      clientErrors['author.name'] = 'Please enter the author name';
    }
    
    if (Object.keys(clientErrors).length > 0) {
      setFormErrors(clientErrors);
      setGeneralError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const createdPost = await blogApi.createPost(formData);
      setHasUnsavedChanges(false);
      router.push(`/admin/blog/posts/${createdPost._id}/edit`);
    } catch (err) {
      console.error('Error creating post:', err);
      
      // Parse error into user-friendly format
      const parsedError = parseApiError(err);
      
      // Set field-specific errors
      const fieldErrors: Record<string, string> = {};
      parsedError.fieldErrors.forEach(({ field, message }) => {
        fieldErrors[field] = message;
      });
      
      setFormErrors(fieldErrors);
      setGeneralError(parsedError.generalMessage);
      setTechnicalDetails(parsedError.technicalDetails);
    } finally {
      setLoading(false);
    }
  };

  const calculateReadingTime = (content: string) => {
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(wordCount / 200); // 200 words per minute
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/blog/posts"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">New Blog Post</h1>
            <p className="text-gray-600 mt-2">Create a new blog post with rich text editor</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {/* Auto-save indicator */}
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            {saving ? (
              <>
                <CloudArrowUpIcon className="h-4 w-4 animate-pulse" />
                <span>Saving...</span>
              </>
            ) : lastSaved ? (
              <>
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              </>
            ) : hasUnsavedChanges ? (
              <>
                <ClockIcon className="h-4 w-4 text-yellow-500" />
                <span>Unsaved changes</span>
              </>
            ) : null}
          </div>
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <EyeIcon className="h-4 w-4 mr-2 inline" />
            Preview
          </button>
        </div>
      </div>

      {/* Error Display */}
      {(generalError || Object.keys(formErrors).length > 0) && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                {generalError || 'Please fix the errors below to continue'}
              </h3>
              {Object.keys(formErrors).length > 0 && (
                <ul className="mt-2 list-disc list-inside text-sm text-red-700">
                  {Object.entries(formErrors).map(([field, message]) => (
                    <li key={field}>
                      <strong>{getFieldDisplayName(field)}:</strong> {message}
                    </li>
                  ))}
                </ul>
              )}
              {technicalDetails && (
                <details className="mt-3">
                  <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                    Technical Details (for developers)
                  </summary>
                  <pre className="mt-2 text-xs text-red-700 bg-red-100 p-2 rounded overflow-auto">
                    {technicalDetails}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  handleTitleChange(e.target.value);
                  // Clear error when user starts typing
                  if (formErrors['title']) {
                    setFormErrors(prev => {
                      const next = { ...prev };
                      delete next['title'];
                      return next;
                    });
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg ${
                  formErrors['title'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter blog post title"
                required
              />
              {formErrors['title'] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {formErrors['title']}
                </p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, slug: e.target.value }));
                  if (formErrors['slug']) {
                    setFormErrors(prev => {
                      const next = { ...prev };
                      delete next['slug'];
                      return next;
                    });
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  formErrors['slug'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="blog-post-slug"
              />
              {formErrors['slug'] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {formErrors['slug']}
                </p>
              )}
            </div>

            {/* Rich Text Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <div className={`border rounded-lg ${formErrors['content'] ? 'border-red-500' : 'border-gray-300'}`}>
                <SimpleRichTextEditor
                  content={formData.content}
                  onChange={(content) => {
                    handleContentChange(content);
                    if (formErrors['content']) {
                      setFormErrors(prev => {
                        const next = { ...prev };
                        delete next['content'];
                        return next;
                      });
                    }
                  }}
                  placeholder="Start writing your blog post..."
                  minHeight={400}
                  maxHeight={800}
                  showWordCount={true}
                  showToolbar={true}
                  onImageUpload={handleImageUpload}
                  className="min-h-[400px]"
                />
              </div>
              {formErrors['content'] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {formErrors['content']}
                </p>
              )}
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Brief description of the post (auto-generated from content)"
              />
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image URL
              </label>
              <input
                type="url"
                value={formData.featuredImage}
                onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Publish Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="h-4 w-4 text-red-700 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                    Featured Post
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="pinned"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPinned: e.target.checked }))}
                    className="h-4 w-4 text-red-700 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="pinned" className="ml-2 text-sm text-gray-700">
                    Pinned Post
                  </label>
                </div>

                {/* Reading Time */}
                {formData.content && (
                  <div className="text-sm text-gray-600">
                    <DocumentTextIcon className="h-4 w-4 inline mr-1" />
                    {calculateReadingTime(formData.content)} min read
                  </div>
                )}
              </div>
            </div>

            {/* Author */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Author</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.author.name}
                    onChange={(e) => {
                      setFormData(prev => ({ 
                        ...prev, 
                        author: { ...prev.author, name: e.target.value }
                      }));
                      if (formErrors['author.name']) {
                        setFormErrors(prev => {
                          const next = { ...prev };
                          delete next['author.name'];
                          return next;
                        });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      formErrors['author.name'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Author name"
                    required
                  />
                  {formErrors['author.name'] && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formErrors['author.name']}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.author.email}
                    onChange={(e) => {
                      setFormData(prev => ({ 
                        ...prev, 
                        author: { ...prev.author, email: e.target.value }
                      }));
                      if (formErrors['author.email']) {
                        setFormErrors(prev => {
                          const next = { ...prev };
                          delete next['author.email'];
                          return next;
                        });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      formErrors['author.email'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="author@example.com"
                    required
                  />
                  {formErrors['author.email'] && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formErrors['author.email']}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={formData.author.bio}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      author: { ...prev.author, bio: e.target.value }
                    }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Author bio"
                  />
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              
              <div className="space-y-2">
                {categories.map((category) => (
                  <label key={category._id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(category._id!)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            categories: [...prev.categories, category._id!]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            categories: prev.categories.filter(id => id !== category._id)
                          }));
                        }
                        setHasUnsavedChanges(true);
                      }}
                      className="h-4 w-4 text-red-700 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              
              <div className="space-y-3">
                <div className="flex">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Add a tag"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-red-700 text-white rounded-r-lg hover:bg-red-800 transition-colors"
                  >
                    Add
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 bg-red-100 text-red-900 text-sm rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-red-700 hover:text-red-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="SEO optimized title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Description
                  </label>
                  <textarea
                    value={formData.seoDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Meta description for search engines"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Keywords
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Add a keyword"
                    />
                    <button
                      type="button"
                      onClick={addKeyword}
                      className="px-4 py-2 bg-red-700 text-white rounded-r-lg hover:bg-red-800 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.seoKeywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(keyword)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Link
            href="/admin/blog/posts"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
