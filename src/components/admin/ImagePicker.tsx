'use client';

import { useState, useEffect } from 'react';
import { fetchJson } from '@/lib/api';
import { PhotoIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface MediaFile {
  _id: string;
  filename: string;
  originalName: string;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  caption?: string;
  category: string;
  tags: string[];
}

interface ImagePickerProps {
  onSelect: (image: MediaFile) => void;
  onClose: () => void;
  isOpen: boolean;
  title?: string;
}

export default function ImagePicker({ onSelect, onClose, isOpen, title = "Select Image" }: ImagePickerProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(search && { search }),
        ...(category && { category })
      });

      const response = await fetchJson(`/media?${queryParams}`);
      setMediaFiles(response.files);
      setTotalPages(response.pages);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen, currentPage, search, category]);

  const handleSelect = (image: MediaFile) => {
    onSelect(image);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search images..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="product">Products</option>
              <option value="category">Categories</option>
              <option value="blog">Blog</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>

        {/* Images Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {mediaFiles.map((image) => (
                <div
                  key={image._id}
                  onClick={() => handleSelect(image)}
                  className="group relative cursor-pointer bg-white rounded-lg border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all duration-200"
                >
                  <div className="aspect-square relative overflow-hidden rounded-t-lg">
                    <img
                      src={image.thumbnailUrl || image.url}
                      alt={image.alt || image.originalName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-white rounded-full p-2 shadow-lg">
                          <PhotoIcon className="w-5 h-5 text-gray-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 truncate" title={image.originalName}>
                      {image.originalName}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {image.category}
                      </span>
                    </div>
                    {image.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {image.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                            {tag}
                          </span>
                        ))}
                        {image.tags.length > 2 && (
                          <span className="text-xs text-gray-400">+{image.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Smart Pagination */}
          {totalPages > 1 && (() => {
            const maxVisible = 7;
            const getPageNumbers = () => {
              if (totalPages <= maxVisible) {
                return Array.from({ length: totalPages }, (_, i) => i + 1);
              }
              
              const pages: (number | string)[] = [];
              const sidePages = 2;
              
              pages.push(1);
              
              if (currentPage - sidePages > 2) {
                pages.push('...');
              }
              
              const start = Math.max(2, currentPage - sidePages);
              const end = Math.min(totalPages - 1, currentPage + sidePages);
              
              for (let i = start; i <= end; i++) {
                pages.push(i);
              }
              
              if (currentPage + sidePages < totalPages - 1) {
                pages.push('...');
              }
              
              if (totalPages > 1) {
                pages.push(totalPages);
              }
              
              return pages;
            };
            
            const pageNumbers = getPageNumbers();
            
            return (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-2 flex-wrap justify-center">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-600 hover:to-rose-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center space-x-1 flex-wrap justify-center max-w-full overflow-x-auto">
                      {pageNumbers.map((page, index) => {
                        if (page === '...') {
                          return (
                            <span key={`ellipsis-${index}`} className="px-2 py-2 text-gray-500 text-sm">
                              ...
                            </span>
                          );
                        }
                        
                        const pageNum = page as number;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`min-w-[2.5rem] px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                              currentPage === pageNum
                                ? 'bg-red-500 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-600 hover:to-rose-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      Next
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-600 whitespace-nowrap">
                    Page {currentPage} of {totalPages}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
