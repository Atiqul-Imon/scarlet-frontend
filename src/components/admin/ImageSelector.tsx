'use client';

import React, { useState } from 'react';
import { PhotoIcon, CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { fetchJsonAuth } from '@/lib/api';
import { uploadImage, validateImageFile } from '@/lib/image-upload';

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
  onImageSelect: (url: string) => void;
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMediaFiles = async () => {
    try {
      setLoading(true);
      const response = await fetchJsonAuth<{
        files: MediaFile[];
        pages: number;
        total: number;
      }>('/media?limit=50');
      console.log('Media files fetched:', response.files);
      setMediaFiles(response.files);
    } catch (error) {
      console.error('Error fetching media files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
    fetchMediaFiles();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setActiveTab('media');
    setSelectedFile(null);
    setSearchTerm('');
  };

  const handleSelectFromMedia = (url: string) => {
    onImageSelect(url);
    handleCloseModal();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        alert(validation.error || 'Invalid file');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadFromComputer = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!selectedFile) return;

    try {
      setUploading(true);
      const result = await uploadImage(selectedFile, productSlug);
      
      if (result.success && result.url) {
        // Also save to media library
        try {
          await fetchJsonAuth('/media', {
            method: 'POST',
            body: JSON.stringify({
              filename: result.data?.filename || selectedFile.name,
              originalName: selectedFile.name,
              url: result.url,
              thumbnailUrl: result.data?.thumbnailUrl,
              size: selectedFile.size,
              mimeType: selectedFile.type,
              alt: selectedFile.name,
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
        alert('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const filteredFiles = mediaFiles.filter(file =>
    file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.alt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  ) : filteredFiles.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <PhotoIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium">No images found</p>
                      <p className="text-sm text-gray-400 mt-2">
                        {mediaFiles.length === 0 ? 'Media gallery is empty. Upload some images first.' : 'No images match your search'}
                      </p>
                      {mediaFiles.length === 0 && (
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
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {filteredFiles.map((file) => (
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
                            onLoad={() => {
                              console.log('Image loaded successfully:', file.thumbnailUrl || file.url);
                            }}
                            onError={(e) => {
                              console.log('Image failed to load:', file.thumbnailUrl || file.url);
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
                      Choose File
                    </button>
                    <p className="mt-2 text-sm text-gray-500">
                      PNG, JPG, WEBP up to 5MB
                    </p>
                  </div>

                  {/* Selected File */}
                  {selectedFile && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-800">
                        ✓ {selectedFile.name}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={(e) => handleUploadFromComputer(e)}
                        disabled={uploading}
                        className="mt-4 w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                          'Upload & Select'
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

