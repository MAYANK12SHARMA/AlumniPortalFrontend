"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, User } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { uploadApi } from "@/lib/api/profile";
import { toast } from "react-hot-toast";

interface ProfilePictureUploaderProps {
  currentImageUrl?: string;
  onImageUploaded?: (url: string) => void;
  onImageRemoved?: () => void;
  className?: string;
  disabled?: boolean;
}

export function ProfilePictureUploader({
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  className,
  disabled = false,
}: ProfilePictureUploaderProps) {
  const [uploading, setUploading] = useState(false);

  // Ensure initial image URL is properly formatted
  const formatImageUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;

    // If the URL is relative, make it absolute
    if (url.startsWith("/media/")) {
      return `http://127.0.0.1:8000${url}`;
    }

    return url;
  };

  const [previewUrl, setPreviewUrl] = useState<string | null>(
    formatImageUrl(currentImageUrl)
  );
  const [dragActive, setDragActive] = useState(false);

  // Update preview URL when currentImageUrl prop changes
  React.useEffect(() => {
    setPreviewUrl(formatImageUrl(currentImageUrl));
  }, [currentImageUrl]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled || acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      // Validate file type
      if (
        !["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(
          file.type
        )
      ) {
        toast.error("Only image files (JPEG, PNG, GIF) are allowed");
        return;
      }

      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      try {
        setUploading(true);
        const response = await uploadApi.uploadProfilePicture(file);

        if (response.success && response.url) {
          // Ensure the URL is properly formatted
          let imageUrl = response.url;

          // If the URL is relative, make it absolute
          if (imageUrl.startsWith("/media/")) {
            imageUrl = `http://127.0.0.1:8000${imageUrl}`;
          }

          onImageUploaded?.(imageUrl);
          setPreviewUrl(imageUrl);
          toast.success("Profile picture uploaded successfully");
        } else {
          throw new Error("Upload failed");
        }
      } catch (error: any) {
        console.error("Upload error:", error);
        if (error?.response) {
          console.error("Server response status:", error.response.status);
          console.error("Server response data:", error.response.data);
        } else if (error?.raw) {
          // If our normalized return included raw
          console.error("Raw uploadApi result:", error.raw);
        }
        toast.error("Failed to upload profile picture");
        setPreviewUrl(currentImageUrl || null);
      } finally {
        setUploading(false);
        // Clean up object URL
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      }
    },
    [disabled, currentImageUrl, onImageUploaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    multiple: false,
    disabled: disabled || uploading,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageRemoved?.();
    toast.success("Profile picture removed");
  };

  return (
    <div className={cn("flex flex-col items-center space-y-5", className)}>
      {/* Current Image Display */}
      <div className="relative group">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-zinc-900 border-2 border-zinc-800 shadow-lg ring-0 group-hover:ring-2 ring-yellow-400/40 transition-all">
          {previewUrl ? (
            // Use regular img tag for external URLs to avoid Next.js Image optimization issues
            previewUrl.startsWith("http") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Profile picture"
                className="w-full h-full object-cover"
                onError={() => {
                  setPreviewUrl(null);
                  toast.error("Failed to load image");
                }}
              />
            ) : (
              <Image
                src={previewUrl}
                alt="Profile picture"
                width={128}
                height={128}
                className="w-full h-full object-cover"
                onError={() => {
                  setPreviewUrl(null);
                  toast.error("Failed to load image");
                }}
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-500">
              <User size={48} />
            </div>
          )}
        </div>

        {/* Remove Button */}
        {previewUrl && !disabled && (
          <Button
            type="button"
            size="sm"
            variant="danger"
            className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
            onClick={handleRemoveImage}
            disabled={uploading}
          >
            <X size={16} />
          </Button>
        )}

        {/* Loading Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400" />
          </div>
        )}
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all bg-zinc-950/50 border-zinc-800 hover:border-yellow-500/40 hover:bg-zinc-900/40",
          {
            "ring-2 ring-yellow-400/40": isDragActive || dragActive,
            "opacity-50 cursor-not-allowed": disabled,
          }
        )}
      >
        <input {...getInputProps()} />

        <Upload className="mx-auto h-12 w-12 text-zinc-400 mb-4" />

        <p className="text-sm text-zinc-300 mb-2">
          {isDragActive
            ? "Drop the image here..."
            : "Drag & drop an image here, or click to select"}
        </p>

        <p className="text-xs text-zinc-500">PNG, JPG, GIF up to 5MB</p>

        {!disabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Choose File"}
          </Button>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center text-xs text-zinc-500 max-w-xs">
        <p>
          Upload a professional photo that represents you well. This will be
          visible to other users in the alumni network.
        </p>
      </div>
    </div>
  );
}
