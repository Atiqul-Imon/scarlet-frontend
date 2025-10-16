'use client';

import React, { useState, useRef } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  placeholder?: string;
  className?: string;
  maxSize?: number; // in MB
  acceptedFormats?: string[];
}

export default function ImageUpload({
  value,
  onChange,
  placeholder = "Click to upload or drag and drop",
  className = "",
  maxSize = 10,
  acceptedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'Please select an image file' };
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return { valid: false, error: `File size must be less than ${maxSize}MB` };
    }

    // Check file extensions
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !acceptedFormats.includes(fileExtension)) {
      return { valid: false, error: `Only ${acceptedFormats.join(', ').toUpperCase()} files are allowed` };
    }

    return { valid: true };
  };

  const uploadToImageKit = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('blogSlug', 'temp');

      const response = await fetch('/api/upload/blog', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Upload failed'
        };
      }

      return {
        success: true,
        url: result.data.url
      };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: 'Network error during upload'
      };
    }
  };

  const handleFileSelect = async (file: File) => {
    setError(null);

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setIsUploading(true);

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Upload to ImageKit
      const result = await uploadToImageKit(file);
      
      if (result.success && result.url) {
        onChange(result.url);
        setError(null);
      } else {
        setError(result.error || 'Upload failed');
        setPreview(null);
      }
    } catch (err) {
      setError('Upload failed');
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          preview 
            ? 'border-green-300 bg-green-50' 
            : 'border-gray-300 hover:border-red-400 hover:bg-gray-50'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.map(format => `.${format}`).join(',')}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="hidden"
          disabled={isUploading}
        />

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 mx-auto rounded-lg shadow-sm"
            />
            {!isUploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="text-sm text-gray-600">
              <p className="font-medium">{placeholder}</p>
              <p className="text-xs text-gray-500 mt-1">
                {acceptedFormats.join(', ').toUpperCase()} up to {maxSize}MB
              </p>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Uploading...</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {value && !error && (
        <p className="text-sm text-green-600">✓ Image uploaded successfully</p>
      )}
    </div>
  );
}
