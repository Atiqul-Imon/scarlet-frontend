import { NextRequest, NextResponse } from 'next/server';
import { getImageKitInstance, validateServerImageKitConfig } from '@/lib/imagekit-config';

// Generate unique folder path for blog images
function generateBlogImagePath(blogSlug: string, filename: string): string {
  const timestamp = Date.now();
  return `blog/${blogSlug}/${timestamp}-${filename}`;
}

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
    const blogSlug = data.get('blogSlug') as string || 'temp';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (10MB limit for blog images)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size must be less than 10MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique file path for ImageKit
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const filename = `blog-${timestamp}-${randomString}.${fileExtension}`;
    const filePath = generateBlogImagePath(blogSlug, filename);

    // Upload to ImageKit
    const imagekit = getImageKitInstance();
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: filename,
      folder: `blog/${blogSlug}`,
      tags: ['blog', 'scarlet'],
      useUniqueFileName: true,
      responseFields: ['url', 'fileId', 'name', 'size', 'thumbnailUrl']
    });

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

  } catch (error) {
    console.error('Blog image upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload blog image to ImageKit' },
      { status: 500 }
    );
  }
}
