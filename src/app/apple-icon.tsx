import { readFile } from 'fs/promises';
import { join } from 'path';

export const runtime = 'nodejs';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default async function AppleIcon() {
  try {
    // Read the apple-touch-icon file
    const iconPath = join(process.cwd(), 'public', 'apple-touch-icon.png');
    const imageBuffer = await readFile(iconPath);
    
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error loading apple icon:', error);
    return new Response('Apple icon not found', { status: 404 });
  }
}

