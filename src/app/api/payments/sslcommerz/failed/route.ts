import { NextResponse } from 'next/server';
import logger from '@/lib/logger';

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
    logger.info('SSLCommerz Failed Callback (GET) received', { hasData: Object.keys(data).length > 0 });

    // Extract relevant data from SSLCommerz response
    const tran_id = data['tran_id'];
    const val_id = data['val_id'];
    const status = data['status'];
    const amount = data['amount'];
    const currency = data['currency'];
    const error = data['error'];
    const error_reason = data['error_reason'];

    // Construct query parameters for the actual failed page
    const queryParams = new URLSearchParams();
    if (tran_id) queryParams.append('tran_id', tran_id);
    if (val_id) queryParams.append('val_id', val_id);
    if (status) queryParams.append('status', status);
    if (amount) queryParams.append('amount', amount);
    if (currency) queryParams.append('currency', currency);
    if (error) queryParams.append('error', error);
    if (error_reason) queryParams.append('error_reason', error_reason);

    // Add failure indicator
    queryParams.append('payment_failed', 'true');

    // Redirect to the actual payment failed page with query parameters
    const baseUrl = new URL(request.url).origin;
    return NextResponse.redirect(new URL(`/payment/failed?${queryParams.toString()}`, baseUrl));

  } catch (error) {
    console.error('Error handling SSLCommerz failed callback:', error);
    const baseUrl = new URL(request.url).origin;
    return NextResponse.redirect(new URL('/payment/failed?message=Payment processing error', baseUrl));
  }
}

export async function POST(request: Request) {
  try {
    const data = await extractCallbackData(request);
    logger.info('SSLCommerz Failed Callback (POST) received', { hasData: Object.keys(data).length > 0 });

    // Extract relevant data from SSLCommerz response
    const tran_id = data['tran_id'];
    const val_id = data['val_id'];
    const status = data['status'];
    const amount = data['amount'];
    const currency = data['currency'];
    const error = data['error'];
    const error_reason = data['error_reason'];

    // Construct query parameters for the actual failed page
    const queryParams = new URLSearchParams();
    if (tran_id) queryParams.append('tran_id', tran_id);
    if (val_id) queryParams.append('val_id', val_id);
    if (status) queryParams.append('status', status);
    if (amount) queryParams.append('amount', amount);
    if (currency) queryParams.append('currency', currency);
    if (error) queryParams.append('error', error);
    if (error_reason) queryParams.append('error_reason', error_reason);

    // Add failure indicator
    queryParams.append('payment_failed', 'true');

    // Redirect to the actual payment failed page with query parameters
    const baseUrl = new URL(request.url).origin;
    return NextResponse.redirect(new URL(`/payment/failed?${queryParams.toString()}`, baseUrl));

  } catch (error) {
    console.error('Error handling SSLCommerz failed callback:', error);
    const baseUrl = new URL(request.url).origin;
    return NextResponse.redirect(new URL('/payment/failed?message=Payment processing error', baseUrl));
  }
}
