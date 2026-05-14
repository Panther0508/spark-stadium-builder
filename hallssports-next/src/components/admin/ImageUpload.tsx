import React, { useState, useCallback, useRef } from 'react';
import { uploadToCloudinary } from '@/lib/cloudinary';

type ImageUploadProps = {
  value?: string;
  currentUrl?: string | null;
  onUpload: (url: string) => void;
  label: string;
};

export default function ImageUpload({ value, currentUrl, onUpload, label }: ImageUploadProps) {
  const url = value ?? currentUrl ?? "";
  const [previewUrl, setPreviewUrl] = useState<string | null>(() => url || null);
  const [prevCurrentUrl, setPrevCurrentUrl] = useState<string | null>(url);

/* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    if (currentUrl !== prevCurrentUrl) {
      setPreviewUrl(currentUrl ?? null);
      setPrevCurrentUrl(currentUrl ?? null);
    }
  }, [currentUrl, prevCurrentUrl]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastRef = useRef<NodeJS.Timeout | null>(null);

  // Show toast for 3 seconds
  const showToast = useCallback((message: string) => {
    setError(message);
    if (toastRef.current) {
      clearTimeout(toastRef.current);
    }
    toastRef.current = setTimeout(() => {
      setError(null);
    }, 3000);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

try {
       const url = await uploadToCloudinary(file);
       if (url) {
         setPreviewUrl(url);
         onUpload(url);
       } else {
         throw new Error('No URL returned from Cloudinary');
       }
     } catch {
       showToast('Upload failed. Please try again.');
     } finally {
      setLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative w-full">
      {/* Preview */}
      <div className="aspect-w-16 aspect-h-9 mb-4 rounded-2xl border-2 border-white/20 backdrop-blur-xl bg-white/10 p-4 relative">
{previewUrl ? (
<img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover rounded-xl"
            />
         ) : (
          <div className="flex flex-col items-center justify-center h-full">
            {/* Placeholder football icon - using a simple emoji for now */}
            <div className="text-6xl text-white/50 mb-2">⚽</div>
            <p className="text-white/70 text-center">No image selected</p>
          </div>
        )}
        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl backdrop-blur-xl">
            <div className="w-8 h-8 border-4 border-white/50 border-t-4 border-white rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Error toast */}
      {error && (
        <div className="absolute top-4 right-4 max-w-xs p-4 bg-red-500/90 backdrop-blur-xl text-white rounded-xl">
          {error}
        </div>
      )}

      {/* Choose file button */}
      <div className="mt-4">
        <label
          htmlFor="upload-input"
          className="inline-flex items-center px-6 py-3 bg-green-500/20 backdrop-blur-xl border border-green-500/40 text-green-400 rounded-xl hover:bg-green-500/30 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16v4a2 2 0 002 2h4m-8-8V4a2 2 0 012-2h4m-8 8a2 2 0 110-4h2a2 2 0 012 2v2m-2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2h-2m-8 8a2 2 0 100-4h2a2 2 0 002 2v2m-2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2h-2m-8 8a2 2 0 110-4h2a2 2 0 012 2v2m-2 4h6a2 2 0 012-2v-4a2 2 0 01-2-2h-2" />
          </svg>
          {label}
        </label>
        <input
          type="file"
          id="upload-input"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}