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

    // Return HTML page with immediate redirect to improve user experience
    const baseUrl = new URL(request.url).origin;
    const redirectUrl = `/payment/success?${queryParams.toString()}`;
    
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Payment Processing...</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            color: white;
        }
        .container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 2rem;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        }
        .spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top: 4px solid white;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        h1 { margin: 0 0 1rem 0; font-size: 1.5rem; }
        p { margin: 0; opacity: 0.9; }
    </style>
</head>
<body>
    <div class="container">
        <div class="spinner"></div>
        <h1>Payment Successful!</h1>
        <p>Processing your payment confirmation...</p>
    </div>
    <script>
        // Immediate redirect
        window.location.replace('${redirectUrl}');
        
        // Fallback redirect after 2 seconds
        setTimeout(() => {
            window.location.replace('${redirectUrl}');
        }, 2000);
    </script>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Error handling SSLCommerz success callback:', error);
    const baseUrl = new URL(request.url).origin;
    return NextResponse.redirect(new URL('/payment/failed?message=Failed to process payment callback', baseUrl));
  }
}
