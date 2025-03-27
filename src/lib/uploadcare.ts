import { UploadClient } from '@uploadcare/upload-client';

// Constants
const UPLOADCARE_PUB_KEY = import.meta.env.VITE_UPLOADCARE_PUBLIC_KEY || 'demopublickey';

const FILE_CONSTRAINTS = {
  maxSize: 1 * 1024 * 1024, // 1MB in bytes
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const
};

// Initialize Uploadcare client
const client = new UploadClient({ publicKey: UPLOADCARE_PUB_KEY });

// Validation function
function validateFile(file: File): void {
  if (!file) {
    throw new Error('No file provided');
  }

  if (file.size > FILE_CONSTRAINTS.maxSize) {
    throw new Error('File size exceeds 1MB limit');
  }

  if (!FILE_CONSTRAINTS.allowedTypes.includes(file.type as typeof FILE_CONSTRAINTS.allowedTypes[number])) {
    throw new Error('Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.');
  }
}

// Main upload function
export async function uploadFile(file: File): Promise<string> {
  try {
    validateFile(file);

    const result = await client.uploadFile(file);

    if (!result?.cdnUrl) {
      throw new Error('Upload failed: No CDN URL received');
    }

    // Return the CDN URL with image optimization parameters
    return `${result.cdnUrl}-/preview/1000x1000/-/quality/smart/-/format/auto/`;
  } catch (error) {
    console.error('Error uploading file:', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      file: {
        name: file.name,
        type: file.type,
        size: file.size
      }
    });

    throw new Error(error instanceof Error ? error.message : 'Failed to upload file');
  }
}