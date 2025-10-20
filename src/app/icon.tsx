import { readFile } from 'fs/promises';
import { join } from 'path';

export const runtime = 'nodejs';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default async function Icon() {
  try {
    // Read the actual favicon file
    const faviconPath = join(process.cwd(), 'public', 'favicon.png');
    const imageBuffer = await readFile(faviconPath);
    
    // Return the image with proper cache headers
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error loading favicon:', error);
    // Return 404 if file not found
    return new Response('Favicon not found', { status: 404 });
  }
}

