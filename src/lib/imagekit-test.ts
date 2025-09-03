import { getImageKitInstance, validateServerImageKitConfig } from './imagekit-config';

export async function testImageKitConnection(): Promise<{
  success: boolean;
  message: string;
  details?: unknown;
}> {
  try {
    // Check server-side configuration
    if (!validateServerImageKitConfig()) {
      return {
        success: false,
        message: 'ImageKit configuration is incomplete. Please check your environment variables.',
        details: {
          hasPublicKey: !!process.env['NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY'],
          hasUrlEndpoint: !!process.env['NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT'],
          hasPrivateKey: !!process.env['IMAGEKIT_PRIVATE_KEY']
        }
      };
    }

    // Test connection by listing files (this will verify credentials)
    const imagekit = getImageKitInstance();
    const files = await imagekit.listFiles({
      limit: 1,
      skip: 0
    });

    return {
      success: true,
      message: 'ImageKit connection successful!',
              details: {
          totalFiles: files.length,
          endpoint: process.env['NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT']
        }
    };

  } catch (error) {
    return {
      success: false,
      message: 'Failed to connect to ImageKit. Please check your credentials.',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        hasPublicKey: !!process.env['NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY'],
        hasUrlEndpoint: !!process.env['NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT'],
        hasPrivateKey: !!process.env['IMAGEKIT_PRIVATE_KEY']
      }
    };
  }
}

export function getImageKitStatus(): {
  configured: boolean;
  missingVars: string[];
} {
  // Check if we're on the client side
  if (typeof window !== 'undefined') {
    // On client side, check if the variables are available
    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
    const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
    
    const missingVars = [];
    if (!publicKey) missingVars.push('NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY');
    if (!urlEndpoint) missingVars.push('NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT');
    
    return {
      configured: missingVars.length === 0,
      missingVars
    };
  }
  
  // On server side, use the same logic
  const requiredClientVars = [
    'NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY',
    'NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT'
  ];

  const missingVars = requiredClientVars.filter(varName => !process.env[varName as keyof NodeJS.ProcessEnv]);

  return {
    configured: missingVars.length === 0,
    missingVars
  };
}
