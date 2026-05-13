"use client";

import { useEffect, useRef } from "react";
import { Upload, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CloudinaryUploadProps {
  onSuccess: (url: string) => void;
  value?: string;
  className?: string;
}

export function CloudinaryUpload({ onSuccess, value, className }: CloudinaryUploadProps) {
  const widgetRef = useRef<{ open: () => void } | null>(null);

  useEffect(() => {
    const win = window as unknown as { cloudinary: { createUploadWidget: (config: object, callback: (error: Error | null, result: { event: string; info: { secure_url: string } }) => void) => { open: () => void } } };
    if (typeof window !== "undefined" && win.cloudinary) {
      widgetRef.current = win.cloudinary.createUploadWidget(
        {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
          sources: ["local", "url", "camera"],
          multiple: false,
          theme: "minimal",
        },
        (error, result) => {
          if (!error && result && result.event === "success") {
            onSuccess(result.info.secure_url);
          }
        }
      );
    }
  }, [onSuccess]);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    widgetRef.current?.open();
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="aspect-video bg-black/20 rounded-lg overflow-hidden flex items-center justify-center border border-white/10 relative group">
        {value ? (
          <>
<img
                src={value}
                alt="Upload preview"
                className="w-full h-full object-cover"
              />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={handleOpen}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold backdrop-blur-sm"
              >
                Change Image
              </button>
            </div>
          </>
        ) : (
          <div className="text-center p-6">
            <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No image selected</p>
          </div>
        )}
      </div>
      {!value && (
        <button
          onClick={handleOpen}
          className="w-full min-h-[44px] px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all"
        >
          <Upload className="w-4 h-4" />
          Upload from Cloudinary
        </button>
      )}
    </div>
  );
}
