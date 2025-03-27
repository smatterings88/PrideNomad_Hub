import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

// Constants
const FILE_CONSTRAINTS = {
  maxSize: 1 * 1024 * 1024, // 1MB in bytes
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const
};

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

    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const storageRef = ref(storage, `business-images/${fileName}`);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    
    return downloadUrl;
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