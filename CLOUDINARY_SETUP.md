# Cloudinary Setup Guide

## 1. Create a Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com) and sign up for a free account
2. After signing in, go to your Dashboard

## 2. Get Your Credentials

From your Cloudinary Dashboard, you'll find:
- **Cloud Name**
- **API Key**
- **API Secret**

## 3. Configure Environment Variables

Add these to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 4. Features Implemented

- Automatic image optimization (quality: auto, format: auto)
- Images are stored in the `ai-content-writer` folder in your Cloudinary account
- Secure HTTPS URLs returned
- Supports JPEG, PNG, GIF, and WebP formats
- 5MB file size limit

## 5. Test the Upload

Upload an image through your editor and it will be automatically uploaded to Cloudinary!
