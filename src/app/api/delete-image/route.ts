import { NextRequest, NextResponse } from 'next/server';
import { getImageKitInstance, validateServerImageKitConfig } from '@/lib/imagekit-config';

export async function DELETE(request: NextRequest) {
  try {
    // Validate ImageKit configuration
    if (!validateServerImageKitConfig()) {
      return NextResponse.json(
        { success: false, error: 'ImageKit configuration is missing' },
        { status: 500 }
      );
    }

    const { url, fileId } = await request.json();

    if (!url && !fileId) {
      return NextResponse.json(
        { success: false, error: 'URL or fileId is required' },
        { status: 400 }
      );
    }

    const imagekit = getImageKitInstance();
    
    // If we have a fileId, use it directly
    let deleteFileId = fileId;
    
    // If we only have URL, extract fileId from it
    if (!deleteFileId && url) {
      deleteFileId = extractFileIdFromUrl(url);
      if (!deleteFileId) {
        return NextResponse.json(
          { success: false, error: 'Could not extract file ID from URL' },
          { status: 400 }
        );
      }
    }

    // Delete from ImageKit
    await imagekit.deleteFile(deleteFileId);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully from ImageKit',
      fileId: deleteFileId
    });

  } catch (error) {
    console.error('ImageKit delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete file from ImageKit' },
      { status: 500 }
    );
  }
}

// Helper function to extract file ID from ImageKit URL
function extractFileIdFromUrl(url: string): string | null {
  try {
    // ImageKit URLs typically have the format: https://ik.imagekit.io/your-id/folder/filename
    // We need to extract the file ID, which is usually the last part of the path
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    
    // For now, we'll use the filename as the file ID
    // In a real implementation, you might need to store the actual file ID
    return filename;
  } catch (error) {
    console.error('Failed to extract file ID from URL:', error);
    return null;
  }
}
