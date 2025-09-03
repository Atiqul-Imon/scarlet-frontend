# ImageKit Setup Guide

## Environment Variables

Create a `.env.local` file in your frontend directory with the following variables:

```bash
# ImageKit Configuration
# Get these values from your ImageKit dashboard: https://imagekit.io/dashboard
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_public_key_here
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_endpoint
IMAGEKIT_PRIVATE_KEY=your_private_key_here
```

## How to Get ImageKit Credentials

1. **Sign up** at [ImageKit.io](https://imagekit.io)
2. **Create a new project** or use existing one
3. **Go to Developer Options** in your dashboard
4. **Copy the following values:**
   - Public Key
   - URL Endpoint
   - Private Key

## Features

- **Cloud Storage**: Images are stored in ImageKit's cloud infrastructure
- **CDN**: Automatic global CDN distribution for fast image loading
- **Image Optimization**: Automatic image optimization and resizing
- **Thumbnails**: Automatic thumbnail generation
- **Organized Structure**: Images are organized by product slug
- **Tags**: Images are tagged for easy management

## Benefits Over Local Storage

- ✅ **Scalability**: No local storage limitations
- ✅ **Performance**: Global CDN for fast image delivery
- ✅ **Reliability**: 99.9% uptime SLA
- ✅ **Management**: Easy image management through dashboard
- ✅ **Optimization**: Automatic image optimization
- ✅ **Backup**: Automatic backup and redundancy
