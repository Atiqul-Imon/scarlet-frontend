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

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Upload failed'
      };
    }

    return {
      success: true,
      data: result.data,
      url: result.data.url
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: 'Network error during upload'
    };
  }
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
