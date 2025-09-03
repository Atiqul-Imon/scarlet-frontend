import ImageKit from 'imagekit';

// Client-side ImageKit configuration (public only)
export const imagekitConfig = {
  publicKey: process.env['NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY'] || '',
  urlEndpoint: process.env['NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT'] || '',
};

// Server-side ImageKit instance (only available on server)
export const getImageKitInstance = () => {
  if (typeof window !== 'undefined') {
    throw new Error('ImageKit instance should only be created on the server side');
  }
  
  const privateKey = process.env['IMAGEKIT_PRIVATE_KEY'];
  if (!privateKey) {
    throw new Error('IMAGEKIT_PRIVATE_KEY is not configured');
  }
  
  return new ImageKit({
    publicKey: imagekitConfig.publicKey,
    privateKey: privateKey,
    urlEndpoint: imagekitConfig.urlEndpoint,
  });
};

// Validate ImageKit configuration (client-side only)
export function validateImageKitConfig(): boolean {
  return !!(imagekitConfig.publicKey && imagekitConfig.urlEndpoint);
}

// Validate server-side configuration
export function validateServerImageKitConfig(): boolean {
  return !!(imagekitConfig.publicKey && imagekitConfig.urlEndpoint && process.env['IMAGEKIT_PRIVATE_KEY']);
}

// Generate unique folder path for products
export function generateProductImagePath(productSlug: string, filename: string): string {
  const timestamp = Date.now();
  return `products/${productSlug}/${timestamp}-${filename}`;
}

// Get public URL for uploaded image
export function getImageKitUrl(filePath: string): string {
  return `${imagekitConfig.urlEndpoint}/${filePath}`;
}
