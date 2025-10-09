import { NextRequest, NextResponse } from 'next/server';
import { getImageKitInstance, validateServerImageKitConfig } from '@/lib/imagekit-config';

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

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (1MB limit for consultations)
    if (file.size > 1 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size must be less than 1MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique file path for consultation images
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const filename = `consultation-${timestamp}-${randomString}.${fileExtension}`;

    // Upload to ImageKit with consultation-specific folder
    const imagekit = getImageKitInstance();
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: filename,
      folder: 'consultations',
      tags: ['consultation', 'skincare', 'scarlet'],
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
        type: file.type
      }
    });

  } catch (error) {
    console.error('ImageKit consultation upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload consultation image' },
      { status: 500 }
    );
  }
}
