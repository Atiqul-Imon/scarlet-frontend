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
    console.log('SSLCommerz Success Callback (GET) received:', data);

    // Extract relevant data from SSLCommerz response
    const tran_id = data['tran_id'];
    const val_id = data['val_id'];
    const status = data['status'];
    const amount = data['amount'];
    const currency = data['currency'];
    const bank_tran_id = data['bank_tran_id'];
    const card_type = data['card_type'];
    const pay_status = data['pay_status'];
    const error = data['error'];

    // Construct query parameters for the actual success page
    const queryParams = new URLSearchParams();
    if (tran_id) queryParams.append('tran_id', tran_id);
    if (val_id) queryParams.append('val_id', val_id);
    if (status) queryParams.append('status', status);
    if (amount) queryParams.append('amount', amount);
    if (currency) queryParams.append('currency', currency);
    if (bank_tran_id) queryParams.append('bank_tran_id', bank_tran_id);
    if (card_type) queryParams.append('card_type', card_type);
    if (pay_status) queryParams.append('pay_status', pay_status);
    if (error) queryParams.append('error', error);

    // Add success indicator
    queryParams.append('payment_success', 'true');

    // Redirect to the actual payment success page with query parameters
    const baseUrl = new URL(request.url).origin;
    return NextResponse.redirect(new URL(`/payment/success?${queryParams.toString()}`, baseUrl));

  } catch (error) {
    console.error('Error handling SSLCommerz success callback:', error);
    const baseUrl = new URL(request.url).origin;
    return NextResponse.redirect(new URL('/payment/failed?message=Failed to process payment callback', baseUrl));
  }
}

export async function POST(request: Request) {
  try {
    const data = await extractCallbackData(request);
    console.log('SSLCommerz Success Callback (POST) received:', data);

    // Extract relevant data from SSLCommerz response
    const tran_id = data['tran_id'];
    const val_id = data['val_id'];
    const status = data['status'];
    const amount = data['amount'];
    const currency = data['currency'];
    const bank_tran_id = data['bank_tran_id'];
    const card_type = data['card_type'];
    const pay_status = data['pay_status'];
    const error = data['error'];

    // Construct query parameters for the actual success page
    const queryParams = new URLSearchParams();
    if (tran_id) queryParams.append('tran_id', tran_id);
    if (val_id) queryParams.append('val_id', val_id);
    if (status) queryParams.append('status', status);
    if (amount) queryParams.append('amount', amount);
    if (currency) queryParams.append('currency', currency);
    if (bank_tran_id) queryParams.append('bank_tran_id', bank_tran_id);
    if (card_type) queryParams.append('card_type', card_type);
    if (pay_status) queryParams.append('pay_status', pay_status);
    if (error) queryParams.append('error', error);

    // Add success indicator
    queryParams.append('payment_success', 'true');

    // Redirect to the actual payment success page with query parameters
    const baseUrl = new URL(request.url).origin;
    return NextResponse.redirect(new URL(`/payment/success?${queryParams.toString()}`, baseUrl));

  } catch (error) {
    console.error('Error handling SSLCommerz success callback:', error);
    const baseUrl = new URL(request.url).origin;
    return NextResponse.redirect(new URL('/payment/failed?message=Failed to process payment callback', baseUrl));
  }
}
