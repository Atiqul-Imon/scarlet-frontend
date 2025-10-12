import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    // Read the apple-touch-icon.png file from public directory
    const appleIconPath = join(process.cwd(), 'public', 'apple-touch-icon.png');
    const appleIconBuffer = await readFile(appleIconPath);
    
    return new NextResponse(appleIconBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': appleIconBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error serving apple icon:', error);
    return new NextResponse('Apple icon not found', { status: 404 });
  }
}
