import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    // Read the favicon.png file from public directory
    const faviconPath = join(process.cwd(), 'public', 'favicon.png');
    const faviconBuffer = await readFile(faviconPath);
    
    return new NextResponse(faviconBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': faviconBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error serving icon:', error);
    return new NextResponse('Icon not found', { status: 404 });
  }
}
