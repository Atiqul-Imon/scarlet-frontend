import { ImageResponse } from 'next/og';
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
    
    // Return the image directly
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=604800, immutable',
      },
    });
  } catch (error) {
    console.error('Error loading favicon:', error);
    
    // Fallback: Generate a simple icon with the letter "S"
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 24,
            background: '#dc2626',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontFamily: 'sans-serif',
          }}
        >
          S
        </div>
      ),
      {
        ...size,
      }
    );
  }
}

