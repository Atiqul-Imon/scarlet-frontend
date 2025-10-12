import { NextResponse } from 'next/server';

// Handle POST requests from SSLCommerz (if any)
export async function POST(request: Request) {
  try {
    console.log('POST request received to /payment/failed');
    
    // Extract data from POST body (form data or JSON)
    let data: { [key: string]: string } = {};
    
    try {
      const formData = await request.formData();
      for (const [key, value] of formData.entries()) {
        data[key] = String(value);
      }
    } catch {
      // If formData fails, try JSON
      try {
        const jsonData = await request.json();
        data = jsonData;
      } catch {
        // If both fail, try URL search params
        const url = new URL(request.url);
        for (const [key, value] of url.searchParams.entries()) {
          data[key] = value;
        }
      }
    }
    
    console.log('POST data received:', data);
    
    // Redirect to the frontend page with query parameters
    const queryParams = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    const baseUrl = new URL(request.url).origin;
    const redirectUrl = new URL(`/payment/failed?${queryParams.toString()}`, baseUrl);
    
    console.log('Redirecting to:', redirectUrl.toString());
    
    return NextResponse.redirect(redirectUrl);
    
  } catch (error) {
    console.error('Error handling POST request to /payment/failed:', error);
    const baseUrl = new URL(request.url).origin;
    return NextResponse.redirect(new URL('/payment/failed?error=processing_error', baseUrl));
  }
}

// Handle GET requests (normal page access)
export async function GET() {
  // This will be handled by the page.tsx file
  return new NextResponse(null, { status: 200 });
}
