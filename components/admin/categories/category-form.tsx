"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import slugify from "slugify";
import ImageUpload from "../product/image-upload";
import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { Category } from "@/supabase/types";
import { Badge } from "@/components/ui/badge";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  is_active: z.boolean().default(true),
  sort_order: z.number().default(0),
  image_url: z.string().min(1, "Image is required"),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  seo_keywords: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  initialData?: Category;
}

export default function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      is_active: initialData?.is_active ?? true,
      sort_order: initialData?.sort_order || 0,
      image_url: initialData?.image_url || "",
      seo_title: initialData?.seo_title || "",
      seo_description: initialData?.seo_description || "",
      seo_keywords: initialData?.seo_keywords
        ? initialData.seo_keywords.join(", ")
        : "",
    },
  });

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      setLoading(true);
      const slug = slugify(data.name, { lower: true, strict: true });

      if (initialData) {
        // Update existing category
        const { error } = await supabase
          .from("categories")
          .update({
            ...data,
            slug,
            seo_keywords: data.seo_keywords
              ? data.seo_keywords.split(",").map((k) => k.trim())
              : null,
          })
          .eq("id", initialData.id);

        if (error) throw error;
        toast.success("Category updated successfully");
      } else {
        // Create new category
        const { error } = await supabase.from("categories").insert([
          {
            ...data,
            slug,
            seo_keywords: data.seo_keywords
              ? data.seo_keywords.split(",").map((k) => k.trim())
              : null,
          },
        ]);

        if (error) throw error;
        toast.success("Category created successfully");
      }

      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      // console.error(error);
      toast.error("Something went wrong", {
        description: `${error}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="general" className="w-full">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Category name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Category description"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value ? [field.value] : []}
                          onChange={(url) => field.onChange(url)}
                          onRemove={() => field.onChange("")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <FormDescription>
                          Make this category visible in the store
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="seo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>SEO Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="seo_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SEO Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="SEO title"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seo_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SEO Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="SEO description"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seo_keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SEO Keywords</FormLabel>
                      <FormControl>
                        <div className="flex flex-wrap gap-2">
                          {field.value?.split(",").map(
                            (keyword, index) =>
                              keyword.trim() && (
                                <Badge key={index} variant="secondary">
                                  {keyword.trim()}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-0 ml-2"
                                    onClick={() => {
                                      const updatedKeywords = field
                                        ?.value!.split(",")
                                        .filter((_, i) => i !== index)
                                        .join(", ");
                                      field.onChange(updatedKeywords);
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </Badge>
                              )
                          )}
                          <Input
                            placeholder="Add a keyword"
                            className="flex-grow"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === ",") {
                                e.preventDefault();
                                const input = e.currentTarget;
                                const newKeyword = input.value.trim();
                                if (newKeyword) {
                                  const updatedKeywords = field.value
                                    ? `${field.value}, ${newKeyword}`
                                    : newKeyword;
                                  field.onChange(updatedKeywords);
                                  input.value = "";
                                }
                              }
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Press Enter or comma to add a keyword
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialData ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{initialData ? "Update Category" : "Create Category"}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
