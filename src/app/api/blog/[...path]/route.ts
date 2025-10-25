import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

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
    
    console.log('Blog API Proxy - GET:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Blog API Proxy Error:', response.status, response.statusText);
      return NextResponse.json(
        { success: false, error: 'Blog API request failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
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
    
    console.log('Blog API Proxy - POST:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('Blog API Proxy Error:', response.status, response.statusText);
      return NextResponse.json(
        { success: false, error: 'Blog API request failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
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
    
    console.log('Blog API Proxy - PUT:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('Blog API Proxy Error:', response.status, response.statusText);
      return NextResponse.json(
        { success: false, error: 'Blog API request failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
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
    
    console.log('Blog API Proxy - DELETE:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    if (!response.ok) {
      console.error('Blog API Proxy Error:', response.status, response.statusText);
      return NextResponse.json(
        { success: false, error: 'Blog API request failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Blog API Proxy Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
