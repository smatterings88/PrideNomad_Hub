import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { uploadFile as uploadToFirebase } from '../../lib/storage';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  onError?: (error: string) => void;
}

export default function ImageUpload({ onUploadComplete, onError }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFirebaseUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadToFirebase(file);
      onUploadComplete(url);
    } catch (error) {
      console.error('Firebase upload error:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        onChange={handleFirebaseUpload}
        accept="image/*"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={uploading}
      />
      <button
        type="button"
        className={`px-3 py-2 text-sm flex items-center gap-2 rounded-md bg-primary-500 text-white hover:bg-primary-600 ${
          uploading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={uploading}
      >
        <Upload className="h-4 w-4" />
        {uploading ? 'Uploading...' : 'Upload Image'}
      </button>
    </div>
  );
}