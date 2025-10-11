import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const data: { [key: string]: string } = {};
    
    // Convert FormData to object
    for (const [key, value] of formData.entries()) {
      data[key] = String(value);
    }

    console.log('SSLCommerz Success Callback (POST) received:', data);

    // Extract relevant data from SSLCommerz response
    const tran_id = data.tran_id;
    const val_id = data.val_id;
    const status = data.status;
    const amount = data.amount;
    const currency = data.currency;
    const bank_tran_id = data.bank_tran_id;
    const card_type = data.card_type;
    const pay_status = data.pay_status;
    const error = data.error;

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
    return NextResponse.redirect(new URL(`/payment/success?${queryParams.toString()}`, request.url));

  } catch (error) {
    console.error('Error handling SSLCommerz success callback:', error);
    // Redirect to payment failed page with error message
    return NextResponse.redirect(new URL('/payment/failed?message=Failed to process payment callback', request.url));
  }
}
