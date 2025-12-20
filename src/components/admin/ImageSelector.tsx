'use client';

import React, { useState, useEffect } from 'react';
import { PhotoIcon, CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { fetchJsonAuth } from '@/lib/api';
import logger from '@/lib/logger';
import { uploadImage, uploadMultipleImages, validateImageFile, validateMultipleImageFiles } from '@/lib/image-upload';

interface MediaFile {
  _id: string;
  filename: string;
  originalName: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  mimeType: string;
  alt?: string;
  createdAt: string;
}

interface ImageSelectorProps {
  onImageSelect: (url: string | string[]) => void; // Support both single and multiple
  productSlug?: string;
  buttonText?: string;
  multiple?: boolean;
}

export default function ImageSelector({ 
  onImageSelect, 
  productSlug = 'temp',
  buttonText = 'Add Image',
  multiple = false
}: ImageSelectorProps) {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'media' | 'upload'>('media');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ completed: number; total: number; current?: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMediaFiles = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search })
      });
      
      const response = await fetchJsonAuth<{
        files: MediaFile[];
        pages: number;
        total: number;
      }>(`/media?${queryParams}`);
      logger.info('Media files fetched', { count: response.files.length, page, totalPages: response.pages });
      setMediaFiles(response.files);
      setTotalPages(response.pages);
    } catch (error) {
      console.error('Error fetching media files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
    setCurrentPage(1);
    setSearchTerm('');
    fetchMediaFiles(1, '');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setActiveTab('media');
    setSelectedFiles([]);
    setUploadProgress(null);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleSelectFromMedia = (url: string) => {
    if (!url || typeof url !== 'string' || url.trim() === '') {
      console.error('Invalid image URL selected:', url);
      return;
    }
    
    if (multiple) {
      // In multiple mode, allow selecting multiple from gallery
      // Modal stays open so user can select more images
      onImageSelect([url]);
      // Show a brief success indicator without closing modal
      // User can manually close when done
    } else {
      onImageSelect(url);
      handleCloseModal();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    if (multiple) {
      // Validate all files
      const validation = validateMultipleImageFiles(files);
      if (!validation.valid) {
        alert(validation.errors.join('\n'));
        // Clear input
        e.target.value = '';
        return;
      }
      setSelectedFiles(files);
    } else {
      // Single file mode - backward compatible
      const file = files[0];
      if (file) {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          alert(validation.error || 'Invalid file');
          e.target.value = '';
          return;
        }
        setSelectedFiles([file]);
      }
    }
  };

  const handleUploadFromComputer = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (selectedFiles.length === 0) return;

    try {
      setUploading(true);
      setUploadProgress({ completed: 0, total: selectedFiles.length });

      if (multiple && selectedFiles.length > 1) {
        // Multiple file upload
        const { results, errors } = await uploadMultipleImages(
          selectedFiles,
          productSlug,
          (progress) => {
            setUploadProgress({
              completed: progress.completed,
              total: progress.total,
              ...(progress.current && { current: progress.current })
            });
          }
        );

        const successfulUploads: string[] = [];
        
        // Save successful uploads to media library and collect URLs
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          const file = selectedFiles[i];
          
          if (result && result.success && result.url && file) {
            successfulUploads.push(result.url);
            
            // Save to media library
            try {
              await fetchJsonAuth('/media', {
                method: 'POST',
                body: JSON.stringify({
                  filename: result.data?.filename || file.name,
                  originalName: file.name,
                  url: result.url,
                  thumbnailUrl: result.data?.thumbnailUrl,
                  size: file.size,
                  mimeType: file.type,
                  alt: file.name,
                  caption: '',
                  tags: [],
                  category: 'product'
                })
              });
            } catch (err) {
              console.error('Failed to save to media library:', err);
            }
          }
        }

        if (successfulUploads.length > 0) {
          onImageSelect(successfulUploads);
          if (errors.length > 0) {
            alert(`Uploaded ${successfulUploads.length} image(s). Some failed:\n${errors.join('\n')}`);
          }
          handleCloseModal();
        } else {
          alert(`Upload failed:\n${errors.join('\n')}`);
        }
      } else {
        // Single file upload (backward compatible)
        const file = selectedFiles[0];
        if (!file) return;
        
        const result = await uploadImage(file, productSlug);
        
        if (result.success && result.url) {
          // Also save to media library
          try {
            await fetchJsonAuth('/media', {
              method: 'POST',
              body: JSON.stringify({
                filename: result.data?.filename || file.name,
                originalName: file.name,
                url: result.url,
                thumbnailUrl: result.data?.thumbnailUrl,
                size: file.size,
                mimeType: file.type,
                alt: file.name,
                caption: '',
                tags: [],
                category: 'product'
              })
            });
          } catch (err) {
            console.error('Failed to save to media library:', err);
          }

          onImageSelect(result.url);
          handleCloseModal();
        } else {
          alert(result.error || 'Upload failed');
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  // Debounce search
  useEffect(() => {
    if (!showModal || activeTab !== 'media') return;
    
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchMediaFiles(1, searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, showModal, activeTab]);

  // Fetch when page changes
  useEffect(() => {
    if (!showModal || activeTab !== 'media') return;
    fetchMediaFiles(currentPage, searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, showModal, activeTab]);

  return (
    <>
      <button
        type="button"
        onClick={handleOpenModal}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-700 hover:bg-red-800 transition-colors"
      >
        <PhotoIcon className="w-5 h-5 mr-2" />
        {buttonText}
      </button>

      {showModal && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Select Image</h2>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCloseModal();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveTab('media');
                }}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'media'
                    ? 'border-b-2 border-red-600 text-red-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <PhotoIcon className="w-5 h-5 inline mr-2" />
                Media Gallery
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveTab('upload');
                }}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'upload'
                    ? 'border-b-2 border-red-600 text-red-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <CloudArrowUpIcon className="w-5 h-5 inline mr-2" />
                Upload from Computer
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {activeTab === 'media' ? (
                <div>
                  {/* Search */}
                  <div className="mb-6">
                    <input
                      type="text"
                      placeholder="Search images..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  {/* Media Grid */}
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700"></div>
                    </div>
                  ) : mediaFiles.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <PhotoIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium">No images found</p>
                      <p className="text-sm text-gray-400 mt-2">
                        {searchTerm ? 'No images match your search' : 'Media gallery is empty. Upload some images first.'}
                      </p>
                      {!searchTerm && (
                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={() => setActiveTab('upload')}
                            className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                            Upload Your First Image
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {mediaFiles.map((file) => (
                          <button
                            key={file._id}
                            type="button"
                            onClick={() => handleSelectFromMedia(file.url)}
                            className="aspect-square bg-white rounded-lg overflow-hidden hover:ring-2 hover:ring-red-500 transition-all border border-gray-200 shadow-sm hover:shadow-md"
                          >
                            <img
                              src={file.thumbnailUrl || file.url}
                              alt={file.alt || file.originalName}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                logger.warn('Image failed to load', { src: file.thumbnailUrl || file.url });
                                const target = e.target as HTMLImageElement;
                                target.src = `data:image/svg+xml;base64,${btoa(`
                                  <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="200" height="200" fill="#f3f4f6"/>
                                    <text x="100" y="100" text-anchor="middle" dy=".3em" font-family="Arial" font-size="14" fill="#6b7280">Image</text>
                                  </svg>
                                `)}`;
                              }}
                            />
                          </button>
                        ))}
                      </div>

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
                                  type="button"
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
                                        type="button"
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
                                  type="button"
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
                    </>
                  )}
                </div>
              ) : (
                <div>
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <CloudArrowUpIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <input
                      ref={(input) => {
                        if (input) {
                          (window as any).fileInputRef = input;
                        }
                      }}
                      type="file"
                      accept="image/*"
                      multiple={multiple}
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                        if (fileInput) {
                          fileInput.click();
                        }
                      }}
                      className="cursor-pointer inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                    >
                      Choose {multiple ? 'Files' : 'File'}
                    </button>
                    <p className="mt-2 text-sm text-gray-500">
                      PNG, JPG, WEBP up to 5MB {multiple ? '(Max 10 files)' : ''}
                    </p>
                  </div>

                  {/* Selected Files */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-6 space-y-3">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-800 mb-3">
                          ✓ {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                        </p>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {selectedFiles.map((file, index) => {
                            if (!file) return null;
                            return (
                              <div key={index} className="flex items-center justify-between text-xs text-green-700 bg-green-100 p-2 rounded">
                                <span className="truncate flex-1">{file.name}</span>
                                <span className="ml-2">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                {multiple && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                                    }}
                                    className="ml-2 text-red-600 hover:text-red-800"
                                  >
                                    <XMarkIcon className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Upload Progress */}
                      {uploadProgress && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-800">
                              Uploading {uploadProgress.completed} of {uploadProgress.total}
                            </span>
                            <span className="text-sm font-bold text-blue-600">
                              {Math.round((uploadProgress.completed / uploadProgress.total) * 100)}%
                            </span>
                          </div>
                          {uploadProgress.current && (
                            <p className="text-xs text-blue-600 mb-2 truncate">
                              Current: {uploadProgress.current}
                            </p>
                          )}
                          <div className="w-full bg-blue-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(uploadProgress.completed / uploadProgress.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleUploadFromComputer(e)}
                        disabled={uploading}
                        className="w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                          `Upload ${selectedFiles.length} ${selectedFiles.length > 1 ? 'Images' : 'Image'}`
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

