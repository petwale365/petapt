// components/admin/products/steps/seo-attributes-form.tsx
"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

import { ProductFormData } from "./types";

interface SEOFormProps {
  form: UseFormReturn<ProductFormData>;
}

export function SEOForm({ form }: SEOFormProps) {
  const [newKeyword, setNewKeyword] = useState("");
  const seoKeywords = form.watch("seo_keywords") || [];

  const addKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (newKeyword.trim() && !seoKeywords.includes(newKeyword.trim())) {
        form.setValue("seo_keywords", [...seoKeywords, newKeyword.trim()]);
        setNewKeyword("");
      }
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    form.setValue(
      "seo_keywords",
      seoKeywords.filter((k) => k !== keywordToRemove)
    );
  };

  return (
    <div className="space-y-6">
      {/* SEO Section */}
      <Card className="border-none shadow-none">
        <CardHeader className="max-md:px-0">
          <CardTitle>SEO Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-md:px-0">
          <div className="space-y-2">
            <Label>SEO Title</Label>
            <Input
              placeholder="SEO optimized title"
              {...form.register("seo_title")}
            />
            <p className="text-xs text-muted-foreground">
              Recommended length: 50-60 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label>SEO Description</Label>
            <Textarea
              placeholder="SEO meta description"
              {...form.register("seo_description")}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Recommended length: 150-160 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label>SEO Keywords</Label>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {seoKeywords.map((keyword, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {keyword}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 px-1 hover:bg-transparent"
                      onClick={() => removeKeyword(keyword)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Type a keyword and press Enter"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={addKeyword}
              />
              <p className="text-xs text-muted-foreground">
                Press Enter or add a comma to add a keyword
              </p>
            </div>
          </div>

          {/* SEO Preview */}
          <div className="rounded-lg border p-4">
            <h4 className="mb-2 font-medium">Search Preview</h4>
            <div className="space-y-1">
              <div className="text-blue-600 hover:underline">
                {form.watch("seo_title") ||
                  form.watch("name") ||
                  "Product Title"}
              </div>
              <div className="text-green-700 text-sm">
                yourstore.com/products/
                {form.watch("name")?.toLowerCase().replace(/\s+/g, "-") ||
                  "product-url"}
              </div>
              <div className="text-sm text-gray-600">
                {form.watch("seo_description") ||
                  form.watch("description")?.slice(0, 160) ||
                  "Product description will appear here..."}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
