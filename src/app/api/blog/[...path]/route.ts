import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';

const BACKEND_URL = process.env['BACKEND_URL'] || 'http://localhost:4000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    
    // Construct the backend URL
    const backendUrl = `${BACKEND_URL}/api/blog/${path}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    logger.info('Blog API Proxy - GET', { url: backendUrl });
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // Blog content is static - cache longer
      next: { revalidate: 3600 }, // 1 hour
    });

    if (!response.ok) {
      console.error('Blog API Proxy Error:', response.status, response.statusText);
      return NextResponse.json(
        { success: false, error: 'Blog API request failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Set cache headers for Vercel Edge caching (blog is static content)
    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
    
    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error('Blog API Proxy Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const body = await request.json();
    
    // Construct the backend URL
    const backendUrl = `${BACKEND_URL}/api/blog/${path}`;
    
    logger.info('Blog API Proxy - POST', { url: backendUrl });
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(body),
      // NO CACHING for write operations
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Blog API Proxy Error:', response.status, response.statusText);
      return NextResponse.json(
        { success: false, error: 'Blog API request failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Ensure no caching for POST requests
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    
    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error('Blog API Proxy Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const body = await request.json();
    
    // Construct the backend URL
    const backendUrl = `${BACKEND_URL}/api/blog/${path}`;
    
    logger.info('Blog API Proxy - PUT', { url: backendUrl });
    
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(body),
      // NO CACHING for write operations
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Blog API Proxy Error:', response.status, response.statusText);
      return NextResponse.json(
        { success: false, error: 'Blog API request failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Ensure no caching for PUT requests
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    
    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error('Blog API Proxy Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    
    // Construct the backend URL
    const backendUrl = `${BACKEND_URL}/api/blog/${path}`;
    
    logger.info('Blog API Proxy - DELETE', { url: backendUrl });
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      // NO CACHING for write operations
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Blog API Proxy Error:', response.status, response.statusText);
      return NextResponse.json(
        { success: false, error: 'Blog API request failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Ensure no caching for DELETE requests
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    
    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error('Blog API Proxy Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
