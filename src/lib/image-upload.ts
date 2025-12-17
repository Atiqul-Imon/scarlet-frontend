export interface UploadResult {
  success: boolean;
  data?: {
    filename: string;
    url: string;
    thumbnailUrl?: string;
    fileId: string;
    size: number;
    type: string;
    path: string;
  };
  url?: string;
  error?: string;
  fileName?: string; // For tracking which file failed
}

export interface MultipleUploadProgress {
  completed: number;
  total: number;
  current?: string; // Current file being uploaded
  results: UploadResult[];
}

export async function uploadImage(file: File, productSlug?: string): Promise<UploadResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    if (productSlug) {
      formData.append('productSlug', productSlug);
    }

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Server returned HTML or other non-JSON response (likely an error page)
      const text = await response.text();
      console.error('Non-JSON response from upload API:', text.substring(0, 200));
      return {
        success: false,
        error: response.status === 504 
          ? 'Upload timeout: The server took too long. Please try again with a smaller file.'
          : `Server error (${response.status}): Please try again later.`,
        fileName: file.name
      };
    }

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Upload failed',
        fileName: file.name
      };
    }

    if (!result.success || !result.data?.url) {
      return {
        success: false,
        error: result.error || 'Invalid response from server',
        fileName: file.name
      };
    }

    return {
      success: true,
      data: result.data,
      url: result.data.url,
      fileName: file.name
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error 
        ? `Network error: ${error.message}` 
        : 'Network error during upload',
      fileName: file.name
    };
  }
}

/**
 * Upload multiple images sequentially with progress tracking
 * Uses the same ImageKit upload endpoint to maintain transformation compatibility
 */
export async function uploadMultipleImages(
  files: File[],
  productSlug?: string,
  onProgress?: (progress: MultipleUploadProgress) => void
): Promise<{ success: boolean; results: UploadResult[]; errors: string[] }> {
  const results: UploadResult[] = [];
  const errors: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Update progress
    if (onProgress) {
      onProgress({
        completed: i,
        total: files.length,
        current: file.name,
        results: [...results]
      });
    }

    // Upload file using the same endpoint (maintains ImageKit compatibility)
    const result = await uploadImage(file, productSlug);
    results.push(result);

    if (!result.success) {
      errors.push(`${file.name}: ${result.error || 'Upload failed'}`);
    }
  }

  // Final progress update
  if (onProgress) {
    onProgress({
      completed: files.length,
      total: files.length,
      results: results
    });
  }

  return {
    success: errors.length === 0,
    results,
    errors
  };
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Please select an image file' };
  }

  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }

  // Check file extensions
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
    return { valid: false, error: 'Only JPG, PNG, GIF, and WebP files are allowed' };
  }

  return { valid: true };
}

/**
 * Validate multiple image files with limits
 */
export function validateMultipleImageFiles(
  files: File[],
  maxFiles: number = 10,
  maxTotalSize: number = 50 * 1024 * 1024 // 50MB total
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check file count
  if (files.length > maxFiles) {
    errors.push(`Maximum ${maxFiles} files allowed. You selected ${files.length} files.`);
    return { valid: false, errors };
  }

  // Check total size
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > maxTotalSize) {
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    const maxSizeMB = (maxTotalSize / (1024 * 1024)).toFixed(0);
    errors.push(`Total file size (${totalSizeMB}MB) exceeds maximum allowed (${maxSizeMB}MB).`);
    return { valid: false, errors };
  }

  // Validate each file
  for (const file of files) {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      errors.push(`${file.name}: ${validation.error || 'Invalid file'}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
