import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface OrderReceiptData {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail?: string | undefined;
  customerPhone?: string | undefined;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    area: string;
    phone: string;
  };
  items: Array<{
    productId: string;
    title: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  paymentMethod: string;
  status: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

export async function generateReceiptPDF(
  receiptElement: HTMLElement,
  orderData: OrderReceiptData,
  filename?: string
): Promise<void> {
  try {
    // Generate canvas from the receipt element
    const canvas = await html2canvas(receiptElement, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: receiptElement.scrollWidth,
      height: receiptElement.scrollHeight,
      ignoreElements: (element) => {
        // Skip elements that might cause color parsing issues
        return element.classList?.contains('ignore-pdf') || false;
      },
      onclone: (clonedDoc) => {
        // Convert lab() colors to hex/rgb in the cloned document and ensure text visibility
        const style = clonedDoc.createElement('style');
        style.textContent = `
          * {
            color: inherit !important;
          }
          .bg-gradient-to-r {
            background: linear-gradient(to right, #e91e63, #9c27b0) !important;
          }
          .text-red-700 {
            color: #e91e63 !important;
          }
          .text-purple-600 {
            color: #9c27b0 !important;
          }
          .bg-red-100 {
            background-color: #fce4ec !important;
          }
          .bg-blue-50 {
            background-color: #eff6ff !important;
          }
          .bg-gray-50 {
            background-color: #f9fafb !important;
          }
          .bg-gray-100 {
            background-color: #f3f4f6 !important;
          }
          .border-gray-200 {
            border-color: #e5e7eb !important;
          }
          .border-gray-300 {
            border-color: #d1d5db !important;
          }
          /* Ensure all text is visible */
          [style*="color: #000000"] {
            color: #000000 !important;
          }
          [style*="color: #1f2937"] {
            color: #1f2937 !important;
          }
          [style*="color: #6b7280"] {
            color: #6b7280 !important;
          }
          [style*="color: #374151"] {
            color: #374151 !important;
          }
          /* Force text visibility for all elements */
          div, span, p, h1, h2, h3, h4, h5, h6 {
            color: #000000 !important;
          }
          /* Override any transparent or invisible text */
          [style*="color: transparent"], [style*="color: rgba(0,0,0,0)"] {
            color: #000000 !important;
          }
        `;
        clonedDoc.head.appendChild(style);
      }
    });

    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');

    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if content is too long
    while (heightLeft >= 0) {
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, -(pageHeight - heightLeft), imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Generate filename if not provided
    const defaultFilename = `receipt-${orderData.orderNumber}-${new Date().toISOString().split('T')[0]}.pdf`;
    const finalFilename = filename || defaultFilename;

    // Download the PDF
    pdf.save(finalFilename);
  } catch (error) {
    console.error('Error generating visual PDF:', error);
    // Fallback to detailed PDF generation
    console.log('Falling back to detailed PDF generation...');
    generateDetailedReceiptPDF(orderData);
  }
}

export function generateReceiptFilename(orderData: OrderReceiptData): string {
  const date = new Date(orderData.orderDate).toISOString().split('T')[0];
  return `receipt-${orderData.orderNumber}-${date}.pdf`;
}

// Alternative method using a more detailed PDF generation
// Simple fallback PDF generation that doesn't use html2canvas
export function generateSimpleReceiptPDF(orderData: OrderReceiptData): void {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  let yPosition = 20;
  const lineHeight = 7;
  const margin = 20;

  // Helper function to add text
  const addText = (text: string, x: number, y: number, options: any = {}) => {
    pdf.setFontSize(options.fontSize || 12);
    pdf.setTextColor(options.color || '#000000');
    pdf.text(text, x, y);
  };

  // Helper function to add line
  const addLine = (y: number) => {
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, y, pageWidth - margin, y);
  };

  // Header
  addText('SCARLET BEAUTY', margin, yPosition, { fontSize: 20, color: '#e91e63' });
  yPosition += lineHeight;
  addText('Your Beauty Destination', margin, yPosition, { fontSize: 10, color: '#666666' });
  yPosition += lineHeight * 2;

  // Order Information
  addText('ORDER RECEIPT', margin, yPosition, { fontSize: 16, color: '#333333' });
  yPosition += lineHeight;
  addLine(yPosition);
  yPosition += lineHeight;

  addText(`Order Number: #${orderData.orderNumber}`, margin, yPosition);
  yPosition += lineHeight;
  addText(`Order Date: ${new Date(orderData.orderDate).toLocaleDateString()}`, margin, yPosition);
  yPosition += lineHeight;
  addText(`Status: ${orderData.status.toUpperCase()}`, margin, yPosition);
  yPosition += lineHeight * 2;

  // Customer Information
  addText('CUSTOMER INFORMATION', margin, yPosition, { fontSize: 14, color: '#333333' });
  yPosition += lineHeight;
  addLine(yPosition);
  yPosition += lineHeight;

  addText(`Name: ${orderData.customerName}`, margin, yPosition);
  yPosition += lineHeight;
  if (orderData.customerEmail) {
    addText(`Email: ${orderData.customerEmail}`, margin, yPosition);
    yPosition += lineHeight;
  }
  if (orderData.customerPhone) {
    addText(`Phone: ${orderData.customerPhone}`, margin, yPosition);
    yPosition += lineHeight;
  }
  yPosition += lineHeight;

  // Order Items
  addText('ORDER ITEMS', margin, yPosition, { fontSize: 14, color: '#333333' });
  yPosition += lineHeight;
  addLine(yPosition);
  yPosition += lineHeight;

  // Order items
  orderData.items.forEach((item) => {
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = 20;
    }

    addText(`${item.title} (Qty: ${item.quantity})`, margin, yPosition, { fontSize: 10 });
    addText(formatPrice(item.price * item.quantity, orderData.currency), pageWidth - 30, yPosition, { fontSize: 10 });
    yPosition += lineHeight;
  });

  yPosition += lineHeight;

  // Order Summary
  addLine(yPosition);
  yPosition += lineHeight;

  addText(`Subtotal: ${formatPrice(orderData.subtotal, orderData.currency)}`, pageWidth - 50, yPosition, { fontSize: 10 });
  yPosition += lineHeight;
  addText(`Shipping: ${formatPrice(orderData.shipping, orderData.currency)}`, pageWidth - 50, yPosition, { fontSize: 10 });
  yPosition += lineHeight;
  if (orderData.tax > 0) {
    addText(`Tax: ${formatPrice(orderData.tax, orderData.currency)}`, pageWidth - 50, yPosition, { fontSize: 10 });
    yPosition += lineHeight;
  }
  addLine(yPosition);
  yPosition += lineHeight;

  addText(`TOTAL: ${formatPrice(orderData.total, orderData.currency)}`, pageWidth - 50, yPosition, { fontSize: 12, color: '#e91e63' });
  yPosition += lineHeight * 2;

  // Footer
  addText('Thank you for shopping with Scarlet Beauty!', margin, yPosition, { fontSize: 10, color: '#666666' });
  yPosition += lineHeight;
  addText('For support: info@scarletunlimited.net', margin, yPosition, { fontSize: 8, color: '#999999' });

  // Save the PDF
  const filename = generateReceiptFilename(orderData);
  pdf.save(filename);
}

export function generateDetailedReceiptPDF(orderData: OrderReceiptData): void {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  let yPosition = 20;
  const lineHeight = 7;
  const margin = 20;

  // Helper function to add text
  const addText = (text: string, x: number, y: number, options: any = {}) => {
    pdf.setFontSize(options.fontSize || 12);
    pdf.setTextColor(options.color || '#000000');
    pdf.text(text, x, y);
  };

  // Helper function to add line
  const addLine = (y: number) => {
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, y, pageWidth - margin, y);
  };

  // Header
  addText('SCARLET BEAUTY', margin, yPosition, { fontSize: 20, color: '#e91e63' });
  yPosition += lineHeight;
  addText('Your Beauty Destination', margin, yPosition, { fontSize: 10, color: '#666666' });
  yPosition += lineHeight * 2;

  // Order Information
  addText('ORDER RECEIPT', margin, yPosition, { fontSize: 16, color: '#333333' });
  yPosition += lineHeight;
  addLine(yPosition);
  yPosition += lineHeight;

  addText(`Order Number: #${orderData.orderNumber}`, margin, yPosition);
  yPosition += lineHeight;
  addText(`Order Date: ${new Date(orderData.orderDate).toLocaleDateString()}`, margin, yPosition);
  yPosition += lineHeight;
  addText(`Status: ${orderData.status.toUpperCase()}`, margin, yPosition);
  yPosition += lineHeight * 2;

  // Customer Information
  addText('CUSTOMER INFORMATION', margin, yPosition, { fontSize: 14, color: '#333333' });
  yPosition += lineHeight;
  addLine(yPosition);
  yPosition += lineHeight;

  addText(`Name: ${orderData.customerName}`, margin, yPosition);
  yPosition += lineHeight;
  if (orderData.customerEmail) {
    addText(`Email: ${orderData.customerEmail}`, margin, yPosition);
    yPosition += lineHeight;
  }
  if (orderData.customerPhone) {
    addText(`Phone: ${orderData.customerPhone}`, margin, yPosition);
    yPosition += lineHeight;
  }
  yPosition += lineHeight;

  // Shipping Address
  addText('SHIPPING ADDRESS', margin, yPosition, { fontSize: 14, color: '#333333' });
  yPosition += lineHeight;
  addLine(yPosition);
  yPosition += lineHeight;

  addText(orderData.shippingAddress.name, margin, yPosition);
  yPosition += lineHeight;
  addText(orderData.shippingAddress.address, margin, yPosition);
  yPosition += lineHeight;
  addText(`${orderData.shippingAddress.area}, ${orderData.shippingAddress.city}`, margin, yPosition);
  yPosition += lineHeight;
  addText(`Phone: ${orderData.shippingAddress.phone}`, margin, yPosition);
  yPosition += lineHeight * 2;

  // Order Items
  addText('ORDER ITEMS', margin, yPosition, { fontSize: 14, color: '#333333' });
  yPosition += lineHeight;
  addLine(yPosition);
  yPosition += lineHeight;

  // Table header
  addText('Item', margin, yPosition, { fontSize: 10, color: '#666666' });
  addText('Qty', pageWidth - 60, yPosition, { fontSize: 10, color: '#666666' });
  addText('Price', pageWidth - 30, yPosition, { fontSize: 10, color: '#666666' });
  yPosition += lineHeight;
  addLine(yPosition);
  yPosition += lineHeight;

  // Order items
  orderData.items.forEach((item) => {
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = 20;
    }

    addText(item.title, margin, yPosition, { fontSize: 10 });
    addText(item.quantity.toString(), pageWidth - 60, yPosition, { fontSize: 10 });
    addText(formatPrice(item.price * item.quantity, orderData.currency), pageWidth - 30, yPosition, { fontSize: 10 });
    yPosition += lineHeight;
  });

  yPosition += lineHeight;

  // Order Summary
  addLine(yPosition);
  yPosition += lineHeight;

  addText(`Subtotal: ${formatPrice(orderData.subtotal, orderData.currency)}`, pageWidth - 50, yPosition, { fontSize: 10 });
  yPosition += lineHeight;
  addText(`Shipping: ${formatPrice(orderData.shipping, orderData.currency)}`, pageWidth - 50, yPosition, { fontSize: 10 });
  yPosition += lineHeight;
  if (orderData.tax > 0) {
    addText(`Tax: ${formatPrice(orderData.tax, orderData.currency)}`, pageWidth - 50, yPosition, { fontSize: 10 });
    yPosition += lineHeight;
  }
  addLine(yPosition);
  yPosition += lineHeight;

  addText(`TOTAL: ${formatPrice(orderData.total, orderData.currency)}`, pageWidth - 50, yPosition, { fontSize: 12, color: '#e91e63' });
  yPosition += lineHeight * 2;

  // Payment Information
  addText('PAYMENT INFORMATION', margin, yPosition, { fontSize: 14, color: '#333333' });
  yPosition += lineHeight;
  addLine(yPosition);
  yPosition += lineHeight;

  addText(`Payment Method: ${orderData.paymentMethod.toUpperCase()}`, margin, yPosition);
  yPosition += lineHeight;
  addText(`Amount Paid: ${formatPrice(orderData.total, orderData.currency)}`, margin, yPosition);
  yPosition += lineHeight * 2;

  // Footer
  addText('Thank you for shopping with Scarlet Beauty!', margin, yPosition, { fontSize: 10, color: '#666666' });
  yPosition += lineHeight;
  addText('For support: info@scarletunlimited.net', margin, yPosition, { fontSize: 8, color: '#999999' });

  // Save the PDF
  const filename = generateReceiptFilename(orderData);
  pdf.save(filename);
}

function formatPrice(amount: number, currency: string): string {
  if (currency === 'BDT') {
    return `৳${amount.toLocaleString('en-US')}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}
