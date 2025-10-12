import { NextResponse } from 'next/server';

// Helper function to extract data from request
async function extractCallbackData(request: Request): Promise<{ [key: string]: string }> {
  const data: { [key: string]: string } = {};
  
  // Check if it's a POST request with form data
  if (request.method === 'POST') {
    try {
      const formData = await request.formData();
      for (const [key, value] of formData.entries()) {
        data[key] = String(value);
      }
    } catch {
      // If formData fails, try to get from JSON body
      try {
        const jsonData = await request.json();
        Object.assign(data, jsonData);
      } catch {
        // Ignore
      }
    }
  }
  
  // For GET requests or if POST failed, try to get from query parameters
  if (Object.keys(data).length === 0) {
    const url = new URL(request.url);
    for (const [key, value] of url.searchParams.entries()) {
      data[key] = value;
    }
  }
  
  return data;
}

// Handle both GET and POST requests from SSLCommerz
export async function GET(request: Request) {
  try {
    const data = await extractCallbackData(request);
    console.log('SSLCommerz Cancelled Callback (GET) received:', data);

    // Extract relevant data from SSLCommerz response
    const tran_id = data['tran_id'];
    const val_id = data['val_id'];
    const status = data['status'];
    const amount = data['amount'];
    const currency = data['currency'];

    // Construct query parameters for the actual cancelled page
    const queryParams = new URLSearchParams();
    if (tran_id) queryParams.append('tran_id', tran_id);
    if (val_id) queryParams.append('val_id', val_id);
    if (status) queryParams.append('status', status);
    if (amount) queryParams.append('amount', amount);
    if (currency) queryParams.append('currency', currency);

    // Add cancellation indicator
    queryParams.append('payment_cancelled', 'true');

    // Redirect to the actual payment cancelled page with query parameters
    const baseUrl = new URL(request.url).origin;
    return NextResponse.redirect(new URL(`/payment/cancelled?${queryParams.toString()}`, baseUrl));

  } catch (error) {
    console.error('Error handling SSLCommerz cancelled callback:', error);
    const baseUrl = new URL(request.url).origin;
    return NextResponse.redirect(new URL('/payment/cancelled?message=Payment was cancelled', baseUrl));
  }
}

export async function POST(request: Request) {
  try {
    const data = await extractCallbackData(request);
    console.log('SSLCommerz Cancelled Callback (POST) received:', data);

    // Extract relevant data from SSLCommerz response
    const tran_id = data['tran_id'];
    const val_id = data['val_id'];
    const status = data['status'];
    const amount = data['amount'];
    const currency = data['currency'];

    // Construct query parameters for the actual cancelled page
    const queryParams = new URLSearchParams();
    if (tran_id) queryParams.append('tran_id', tran_id);
    if (val_id) queryParams.append('val_id', val_id);
    if (status) queryParams.append('status', status);
    if (amount) queryParams.append('amount', amount);
    if (currency) queryParams.append('currency', currency);

    // Add cancellation indicator
    queryParams.append('payment_cancelled', 'true');

    // Redirect to the actual payment cancelled page with query parameters
    const baseUrl = new URL(request.url).origin;
    return NextResponse.redirect(new URL(`/payment/cancelled?${queryParams.toString()}`, baseUrl));

  } catch (error) {
    console.error('Error handling SSLCommerz cancelled callback:', error);
    const baseUrl = new URL(request.url).origin;
    return NextResponse.redirect(new URL('/payment/cancelled?message=Payment was cancelled', baseUrl));
  }
}
