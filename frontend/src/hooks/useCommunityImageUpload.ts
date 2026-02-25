import { useState } from 'react';
import { ExternalBlob } from '../backend';
import { fileToBytes } from '../lib/imageValidation';

export function useCommunityImageUpload() {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File): Promise<string> => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const bytes = await fileToBytes(file);
      const blob = ExternalBlob.fromBytes(bytes as Uint8Array<ArrayBuffer>).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      // Get the direct URL for the uploaded blob
      const url = blob.getDirectURL();
      
      setUploadProgress(100);
      setIsUploading(false);
      
      return url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      setError(errorMessage);
      setIsUploading(false);
      throw new Error(errorMessage);
    }
  };

  const reset = () => {
    setUploadProgress(0);
    setIsUploading(false);
    setError(null);
  };

  return {
    uploadImage,
    uploadProgress,
    isUploading,
    error,
    reset,
  };
}
