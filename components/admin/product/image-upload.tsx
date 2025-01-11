"use client";

import { useCallback, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import Image from "next/image";

import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  value: string[];
}

const ImageUpload = ({
  disabled,
  onChange,
  onRemove,
  value,
}: ImageUploadProps) => {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const onDrop = useCallback(
    async (acceptedFiles: FileWithPath[]) => {
      try {
        setLoading(true);

        for (const file of acceptedFiles) {
          // Create a unique file name
          const fileExt = file.name.split(".").pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `product-images/${fileName}`;

          // Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from("products")
            .upload(filePath, file);

          if (uploadError) {
            throw uploadError;
          }

          // Get public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from("products").getPublicUrl(filePath);

          onChange(publicUrl);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setLoading(false);
      }
    },
    [onChange, supabase.storage]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    disabled: disabled || loading,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          "mb-4 flex flex-col items-center justify-center rounded-lg border border-dashed p-6 transition-colors",
          isDragActive && "border-primary/50 bg-secondary",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-1 text-center">
          <Upload className="h-6 w-6" />
          <p className="text-sm">Drag & drop or click to upload</p>
          <p className="text-xs text-muted-foreground">
            Max file size: 5MB. Supported formats: PNG, JPG, JPEG, WEBP
          </p>
        </div>
      </div>

      {/* Image Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {value.map((url) => (
            <div
              key={url}
              className="group relative aspect-square rounded-lg overflow-hidden"
            >
              <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => onRemove(url)}
                  disabled={disabled || loading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Image
                src={url}
                alt="Product image"
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
