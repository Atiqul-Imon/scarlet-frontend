import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const queryString = searchParams.toString();
    
    const backendUrl = `${BACKEND_URL}/api/catalog/${path}${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json(data);
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
    });
    
    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Catalog API proxy error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch from backend' },
      { status: 500 }
    );
  }
}
