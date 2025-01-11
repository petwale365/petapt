// components/admin/products/steps/media-form.tsx
"use client";

import { UseFormReturn } from "react-hook-form";
import { useCallback, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Image as ImageIcon, Loader2, Star, X } from "lucide-react";
import Image from "next/image";
import { ProductFormData } from "./types";

interface MediaFormProps {
  form: UseFormReturn<ProductFormData>;
}

export function MediaForm({ form }: MediaFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClient();

  const onDrop = useCallback(
    async (acceptedFiles: FileWithPath[]) => {
      try {
        setIsUploading(true);
        const currentImages = form.watch("images") || [];

        for (const file of acceptedFiles) {
          // Create unique filename
          const fileExt = file.name.split(".").pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `product-images/${fileName}`;

          // Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from("products")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          // Get public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from("products").getPublicUrl(filePath);

          // Add to form state
          form.setValue("images", [
            ...currentImages,
            {
              url: publicUrl,
              alt_text: "",
              is_thumbnail: currentImages.length === 0, // First image is thumbnail
              sort_order: currentImages.length,
            },
          ]);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setIsUploading(false);
      }
    },
    [form, supabase]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    disabled: isUploading,
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 5,
  });

  const images = form.watch("images") || [];

  //   Function to set a specific image as the thumbnail
  const setThumbnail = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      is_thumbnail: i === index,
    }));
    form.setValue("images", newImages);
  };

  //   Function to remove an image
  const removeImage = async (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    // If we removed the thumbnail, set the first image as thumbnail
    if (newImages.length > 0 && !newImages.some((img) => img.is_thumbnail)) {
      newImages[0].is_thumbnail = true;
    }
    form.setValue("images", newImages);
  };

  //   Function to update alt text
  const updateAltText = (index: number, alt_text: string) => {
    const newImages = [...images];
    newImages[index] = {
      ...newImages[index],
      alt_text,
    };
    form.setValue("images", newImages);
  };

  return (
    <div className="space-y-6 ">
      <Card className="border-transparent shadow-none">
        <CardContent className="pt-6 max-md:px-0">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 transition-colors",
              isDragActive
                ? "border-primary/50 bg-primary/5"
                : "border-violet-200 bg-violet-50/50",
              isUploading && "pointer-events-none opacity-50"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              {isUploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <p className="text-sm font-medium">
                    Drop images here or click to upload
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Upload up to 10 images (max 5MB each)
                  </p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <Card key={image.url} className="overflow-hidden">
              <div className="relative aspect-square">
                <Image
                  src={image.url}
                  alt={image.alt_text || "Product image"}
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant={image.is_thumbnail ? "default" : "secondary"}
                    >
                      {image.is_thumbnail ? "Thumbnail" : `Image ${index + 1}`}
                    </Badge>
                    <div className="flex gap-1">
                      {!image.is_thumbnail && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          onClick={() => setThumbnail(index)}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Label htmlFor={`alt-text-${index}`}>Alt Text</Label>
                  <Input
                    id={`alt-text-${index}`}
                    placeholder="Describe this image"
                    value={image.alt_text || ""}
                    onChange={(e) => updateAltText(index, e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
