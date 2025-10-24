'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context';
import { fetchJsonAuth } from '@/lib/api';
import { 
  CloudArrowUpIcon, 
  MagnifyingGlassIcon,
  PhotoIcon,
  TrashIcon,
  TagIcon
} from '@heroicons/react/24/outline';

interface MediaFile {
  _id: string;
  filename: string;
  originalName: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  alt?: string;
  caption?: string;
  tags: string[];
  category: 'product' | 'category' | 'blog' | 'general';
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface MediaFilters {
  category?: string;
  tags?: string[];
  search?: string;
  mimeType?: string;
}

interface MediaStats {
  totalFiles: number;
  totalSize: number;
  byCategory: Record<string, number>;
  byMimeType: Record<string, number>;
}

export default function MediaGalleryPage() {
  const { user } = useAuth();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filters, setFilters] = useState<MediaFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<MediaStats | null>(null);

  // Fetch media files
  const fetchMediaFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(filters.category && { category: filters.category }),
        ...(filters.search && { search: filters.search }),
        ...(filters.mimeType && { mimeType: filters.mimeType }),
        ...(filters.tags && filters.tags.length > 0 && { tags: filters.tags.join(',') })
      });

      const response = await fetchJsonAuth<{
        files: MediaFile[];
        pages: number;
        total: number;
      }>(`/media?${queryParams}`);
      setMediaFiles(response.files);
      setTotalPages(response.pages);
    } catch (err) {
      setError('Failed to load media files');
      console.error('Error fetching media files:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch media stats
  const fetchStats = async () => {
    try {
      const response = await fetchJsonAuth<MediaStats>('/media/stats/overview');
      setStats(response);
    } catch (err) {
      console.error('Error fetching media stats:', err);
    }
  };

  useEffect(() => {
    fetchMediaFiles();
    fetchStats();
  }, [currentPage, filters]);

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;
    
    if (!confirm(`Delete ${selectedFiles.length} selected files? This action cannot be undone.`)) return;
    
    try {
      setLoading(true);
      await Promise.all(
        selectedFiles.map(fileId => 
          fetchJsonAuth(`/media/${fileId}`, { method: 'DELETE' })
        )
      );
      
      setSelectedFiles([]);
      fetchMediaFiles();
      fetchStats();
    } catch (err) {
      console.error('Error deleting files:', err);
      setError('Failed to delete some files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSingleDelete = async (fileId: string, filename: string) => {
    if (!confirm(`Delete "${filename}"? This action cannot be undone.`)) return;
    
    try {
      setLoading(true);
      await fetchJsonAuth(`/media/${fileId}`, { method: 'DELETE' });
      fetchMediaFiles();
      fetchStats();
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      
      // Create simple form data for ImageKit upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('productSlug', 'media-gallery'); // Use a generic slug for media gallery
      
      // Upload to ImageKit
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      const uploadResult = await uploadResponse.json();
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }
      
      // Save to media gallery database with minimal data
      const mediaData = {
        filename: uploadResult.data.filename,
        originalName: file.name,
        url: uploadResult.data.url,
        thumbnailUrl: uploadResult.data.thumbnailUrl,
        size: uploadResult.data.size,
        mimeType: file.type,
        width: uploadResult.data.width,
        height: uploadResult.data.height,
        alt: file.name, // Use filename as alt text
        caption: '',
        tags: [],
        category: 'general'
      };
      
      // Save to backend media collection
      await fetchJsonAuth('/media', {
        method: 'POST',
        body: JSON.stringify(mediaData)
      });
      
      // Refresh the media list
      fetchMediaFiles();
      fetchStats();
      
      setShowUploadModal(false);
      setUploadProgress(100);
      
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload file: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      product: 'bg-blue-100 text-blue-800',
      category: 'bg-green-100 text-green-800',
      blog: 'bg-purple-100 text-purple-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Media Gallery</h1>
            <p className="text-gray-600">Manage your images and media files</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
            >
              <CloudArrowUpIcon className="w-4 h-4 mr-2" />
              Upload Files
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <PhotoIcon className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Files</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalFiles}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <TagIcon className="w-8 h-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Size</p>
                  <p className="text-2xl font-bold text-gray-900">{formatFileSize(stats.totalSize)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">P</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Products</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.byCategory['product'] || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">C</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Categories</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.byCategory['category'] || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <select
                value={filters.category || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  category: e.target.value || 'general' 
                }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="product">Products</option>
                <option value="category">Categories</option>
                <option value="blog">Blog</option>
                <option value="general">General</option>
              </select>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-2">
              {selectedFiles.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  <TrashIcon className="w-4 h-4 mr-1" />
                  Delete ({selectedFiles.length})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Media Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg"></div>
                <div className="mt-2 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <PhotoIcon className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load media</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchMediaFiles}
              className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mediaFiles.map((file) => (
                <div
                  key={file._id}
                  className={`group relative bg-white rounded-lg shadow-sm border-2 transition-all duration-200 ${
                    selectedFiles.includes(file._id) 
                      ? 'border-red-500 ring-2 ring-red-200' 
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <div className="aspect-square relative overflow-hidden rounded-t-lg bg-white">
                    <img
                      src={file.thumbnailUrl || file.url}
                      alt={file.alt || file.originalName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `data:image/svg+xml;base64,${btoa(`
                          <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                            <rect width="200" height="200" fill="#f3f4f6"/>
                            <text x="100" y="100" text-anchor="middle" dy=".3em" font-family="Arial" font-size="14" fill="#6b7280">Image</text>
                          </svg>
                        `)}`;
                      }}
                    />
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file._id)}
                      onChange={() => handleFileSelect(file._id)}
                      className="absolute top-2 left-2 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                  </div>
                  <div className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-xs font-medium text-gray-900 truncate flex-1" title={file.originalName}>
                        {file.originalName}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSingleDelete(file._id, file.originalName);
                        }}
                        className="ml-2 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete this file"
                      >
                        <TrashIcon className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(file.category)}`}>
                        {file.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                    {file.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {file.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                            {tag}
                          </span>
                        ))}
                        {file.tags.length > 2 && (
                          <span className="text-xs text-gray-400">+{file.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <UploadModal
            onClose={() => setShowUploadModal(false)}
            onUpload={handleFileUpload}
            uploading={uploading}
            progress={uploadProgress}
          />
        )}
      </div>
  );
}

// Upload Modal Component
function UploadModal({ 
  onClose, 
  onUpload, 
  uploading, 
  progress 
}: { 
  onClose: () => void; 
  onUpload: (file: File) => void;
  uploading: boolean;
  progress: number;
}) {
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    await onUpload(file);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Upload Media File</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={uploading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Select Image File
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-700 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                  required
                />
              </div>
              {file && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800">
                    ✓ {file.name}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Uploading...</span>
                  <span className="text-sm font-bold text-red-600">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Please don't close this window during upload
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex space-x-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!file || uploading}
                className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {uploading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  'Upload File'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
