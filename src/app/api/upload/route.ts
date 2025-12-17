import { NextRequest, NextResponse } from 'next/server';
import { getImageKitInstance, validateServerImageKitConfig, generateProductImagePath } from '@/lib/imagekit-config';

// Timeout for ImageKit upload (30 seconds)
const UPLOAD_TIMEOUT = 30000;

export async function POST(request: NextRequest) {
  try {
    // Validate ImageKit configuration
    if (!validateServerImageKitConfig()) {
      return NextResponse.json(
        { success: false, error: 'ImageKit configuration is missing' },
        { status: 500 }
      );
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const productSlug = data.get('productSlug') as string || 'temp';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size must be less than 5MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique file path for ImageKit
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const filename = `product-${timestamp}-${randomString}.${fileExtension}`;
    const filePath = generateProductImagePath(productSlug, filename);

    // Upload to ImageKit with timeout
    const imagekit = getImageKitInstance();
    
    // Create a promise that rejects after timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Upload timeout: ImageKit request took too long')), UPLOAD_TIMEOUT);
    });

    // Race between upload and timeout
    const uploadResponse = await Promise.race([
      imagekit.upload({
        file: buffer,
        fileName: filename,
        folder: `products/${productSlug}`,
        tags: ['product', 'scarlet'],
        useUniqueFileName: true,
        responseFields: ['url', 'fileId', 'name', 'size', 'thumbnailUrl']
      }),
      timeoutPromise
    ]) as any;

    return NextResponse.json({
      success: true,
      data: {
        filename: uploadResponse.name,
        url: uploadResponse.url,
        thumbnailUrl: uploadResponse.thumbnailUrl,
        fileId: uploadResponse.fileId,
        size: uploadResponse.size,
        type: file.type,
        path: filePath
      }
    });

  } catch (error: any) {
    console.error('ImageKit upload error:', error);
    
    // Always return JSON, never HTML
    const errorMessage = error?.message || 'Failed to upload file to ImageKit';
    const isTimeout = errorMessage.includes('timeout');
    
    return NextResponse.json(
      { 
        success: false, 
        error: isTimeout 
          ? 'Upload timeout: The server took too long to process your image. Please try again with a smaller file.' 
          : errorMessage
      },
      { status: isTimeout ? 504 : 500 }
    );
  }
}
