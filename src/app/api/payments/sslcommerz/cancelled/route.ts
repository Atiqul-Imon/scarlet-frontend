import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const data: { [key: string]: string } = {};
    
    // Convert FormData to object
    for (const [key, value] of formData.entries()) {
      data[key] = String(value);
    }

    console.log('SSLCommerz Cancelled Callback (POST) received:', data);

    // Extract relevant data from SSLCommerz response
    const tran_id = data.tran_id;
    const val_id = data.val_id;
    const status = data.status;
    const amount = data.amount;
    const currency = data.currency;

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
    return NextResponse.redirect(new URL(`/payment/cancelled?${queryParams.toString()}`, request.url));

  } catch (error) {
    console.error('Error handling SSLCommerz cancelled callback:', error);
    // Redirect to payment cancelled page with generic error message
    return NextResponse.redirect(new URL('/payment/cancelled?message=Payment was cancelled', request.url));
  }
}
