import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:4000';

// Force dynamic rendering for this route to ensure query params are properly handled
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable static generation

/**
 * Determine cache duration based on endpoint type
 * SAFE TO CACHE: All GET requests are read-only display data
 * Stock validation happens on backend during cart/order operations (not through this proxy)
 */
function getCacheDuration(path: string): number {
  // Categories change rarely - cache longer
  if (path.includes('categories')) {
    return 1800; // 30 minutes
  }
  
  // Product listings and details - cache shorter (prices/stock may change)
  if (path.includes('products')) {
    return 300; // 5 minutes
  }
  
  // Default cache for other catalog endpoints
  return 600; // 10 minutes
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const queryString = searchParams.toString();
    
    // Build backend URL with query parameters
    const backendUrl = `${BACKEND_URL}/api/catalog/${path}${queryString ? `?${queryString}` : ''}`;
    
    // CRITICAL FIX: Disable Next.js fetch cache entirely
    // Next.js fetch cache with revalidate doesn't properly differentiate query params
    // We'll rely on Vercel Edge cache headers instead which properly handle query params
    const hasQueryParams = queryString.length > 0;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Disable Next.js fetch cache - it doesn't properly handle query params
      // Vercel Edge will cache based on full URL (including query params) via Cache-Control headers
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }
    
    const data = await response.json();
    
    // Set cache headers for Vercel Edge caching
    // Vercel Edge cache properly handles query params in the cache key
    const cacheDuration = getCacheDuration(path);
    const headers = new Headers();
    
    // Vercel Edge cache uses the full URL (including query params) as cache key
    // This ensures different query params get different cache entries
    headers.set('Cache-Control', `public, s-maxage=${cacheDuration}, stale-while-revalidate=${cacheDuration * 2}`);
    
    // Add Vary header to ensure proper cache differentiation
    if (hasQueryParams) {
      headers.set('Vary', 'Accept, Accept-Encoding');
    }
    
    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error('Catalog API proxy error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch from backend' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const body = await request.json();
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    
    const backendUrl = `${BACKEND_URL}/api/catalog/${path}`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      // NO CACHING for write operations
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }
    
    const data = await response.json();
    
    // Ensure no caching for POST requests
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    
    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error('Catalog API proxy error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch from backend' },
      { status: 500 }
    );
  }
}
