// components/admin/products/product-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { productSchema, type ProductFormData } from "./types";
import { Steps } from "./steps";
import { BasicDetailsForm } from "./basic-details-form";
import { MediaForm } from "./media-form";
import { VariantsForm } from "./variants-form";
import { AttributesForm } from "./attributes-form";
import { SEOForm } from "./seo-form";
import { createUniqueSlug } from "./action";

interface ProductFormProps {
  categories: Array<{ id: string; name: string }>;
  initialData?: ProductFormData;
  isEditing?: boolean;
  productId?: string;
}

const STEPS = [
  {
    title: "Basic Details",
    description: "Add basic product information",
    fields: [
      "name",
      "description",
      "base_price",
      "category_id",
      "is_active",
      "is_featured",
    ],
  },

  {
    title: "Media",
    description: "Add product images",
    fields: ["images"],
  },
  {
    title: "Variants",
    description: "Configure product variants",
    fields: ["options", "variants"],
  },
  {
    title: "Attributes",
    description: "Add product attributes",
    fields: ["attributes"],
  },
  {
    title: "SEO",
    description: "Add SEO information",
    fields: ["seo_title", "seo_description", "seo_keywords"],
  },
];

export function ProductForm({
  categories,
  initialData,
  isEditing = false,
  productId,
}: ProductFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      base_price: 0,
      sale_price: null,
      is_active: true,
      is_featured: false,
      images: [],
      options: [],
      variants: [],
      seo_keywords: [],
      attributes: [],
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    if (currentStep !== STEPS.length - 1) {
      return handleNext();
    }

    try {
      setIsSubmitting(true);

      if (isEditing && productId) {
        // Update existing product
        const { error: productError } = await supabase
          .from("products")
          .update({
            name: data.name,
            description: data.description,
            category_id: data.category_id,
            base_price: data.base_price,
            sale_price: data.sale_price,
            is_active: data.is_active,
            is_featured: data.is_featured,
            seo_title: data.seo_title,
            seo_description: data.seo_description,
            seo_keywords: data.seo_keywords,
          })
          .eq("id", productId);

        if (productError) throw productError;

        // Update category
        if (data.category_id) {
          await supabase
            .from("product_categories")
            .delete()
            .eq("product_id", productId);

          await supabase.from("product_categories").insert({
            product_id: productId,
            category_id: data.category_id,
          });
        }

        // Update images
        await supabase
          .from("product_images")
          .delete()
          .eq("product_id", productId);

        if (data.images.length > 0) {
          await supabase.from("product_images").insert(
            data.images.map((image, index) => ({
              product_id: productId,
              url: image.url,
              alt_text: image.alt_text,
              is_thumbnail: image.is_thumbnail,
              sort_order: index,
            }))
          );
        }

        // Update options and variants
        // First, delete existing options and related data
        await Promise.all([
          supabase
            .from("variant_option_values")
            .delete()
            .eq("variant_id", productId),
          supabase
            .from("product_variants")
            .delete()
            .eq("product_id", productId),
          supabase.from("option_values").delete().eq("option_id", productId),
          supabase
            .from("product_options_assignments")
            .delete()
            .eq("product_id", productId),
          supabase.from("product_options").delete().eq("id", productId),
        ]);

        // Then create new options and variants
        for (const option of data.options) {
          const { data: optionData } = await supabase
            .from("product_options")
            .insert({
              name: option.name,
              display_name: option.display_name,
              type: "select",
              required: true,
              sort_order: 0,
            })
            .select()
            .single();

          if (optionData) {
            await supabase.from("product_options_assignments").insert({
              product_id: productId,
              option_id: optionData.id,
            });

            await supabase.from("option_values").insert(
              option.values.map((value) => ({
                option_id: optionData.id,
                value: value.value,
                display_value: value.display_value,
                sort_order: 0,
              }))
            );
          }
        }

        // Create new variants
        if (data.variants.length > 0) {
          const { data: createdVariants } = await supabase
            .from("product_variants")
            .insert(
              data.variants.map((variant) => ({
                product_id: productId,
                sku: variant.sku || "",
                price: variant.price,
                stock_quantity: variant.stock_quantity,
                is_active: variant.is_active,
              }))
            )
            .select();

          if (createdVariants) {
            for (let i = 0; i < data.variants.length; i++) {
              const variant = data.variants[i];
              const createdVariant = createdVariants[i];

              const { data: options } = await supabase
                .from("product_options")
                .select("id")
                .eq("product_id", productId);

              if (options) {
                const optionValues = variant.option_values.map((ov) => ({
                  variant_id: createdVariant.id,
                  option_id: options.find((o) => o.id === ov.option_id)?.id,
                  option_value_id: ov.value_id,
                }));

                await supabase
                  .from("variant_option_values")
                  .insert(optionValues);
              }
            }
          }
        }

        // Update attributes
        await supabase
          .from("product_attributes")
          .delete()
          .eq("product_id", productId);

        if (data.attributes.length > 0) {
          await supabase.from("product_attributes").insert(
            data.attributes.map((attr) => ({
              product_id: productId,
              name: attr.name,
              value: attr.value,
            }))
          );
        }
      } else {
        // Create new product
        const uniqueSlug = await createUniqueSlug(data.name);
        const { data: product, error: productError } = await supabase
          .from("products")
          .insert({
            name: data.name,
            description: data.description,
            category_id: data.category_id,
            base_price: data.base_price,
            sale_price: data.sale_price,
            is_active: data.is_active,
            is_featured: data.is_featured,
            seo_title: data.seo_title,
            seo_description: data.seo_description,
            seo_keywords: data.seo_keywords,
            slug: uniqueSlug,
          })
          .select()
          .single();

        if (productError) throw productError;

        if (product) {
          // Create category association
          if (data.category_id) {
            await supabase.from("product_categories").insert({
              product_id: product.id,
              category_id: data.category_id,
            });
          }

          // Create images
          if (data.images.length > 0) {
            await supabase.from("product_images").insert(
              data.images.map((image, index) => ({
                product_id: product.id,
                url: image.url,
                alt_text: image.alt_text,
                is_thumbnail: image.is_thumbnail,
                sort_order: index,
              }))
            );
          }

          // Create options and variants
          for (const option of data.options) {
            const { data: optionData } = await supabase
              .from("product_options")
              .insert({
                name: option.name,
                display_name: option.display_name,
                type: "select",
                required: true,
                sort_order: 0,
              })
              .select()
              .single();

            if (optionData) {
              await supabase.from("product_options_assignments").insert({
                product_id: product.id,
                option_id: optionData.id,
              });

              await supabase.from("option_values").insert(
                option.values.map((value) => ({
                  option_id: optionData.id,
                  value: value.value,
                  display_value: value.display_value,
                  sort_order: 0,
                }))
              );
            }
          }

          // Create variants
          if (data.variants.length > 0) {
            const { data: createdVariants } = await supabase
              .from("product_variants")
              .insert(
                data.variants.map((variant) => ({
                  product_id: product.id,
                  sku: variant.sku || "",
                  price: variant.price,
                  stock_quantity: variant.stock_quantity,
                  is_active: variant.is_active,
                }))
              )
              .select();

            if (createdVariants) {
              for (let i = 0; i < data.variants.length; i++) {
                const variant = data.variants[i];
                const createdVariant = createdVariants[i];

                const { data: options } = await supabase
                  .from("product_options")
                  .select("id")
                  .eq("product_id", product.id);

                if (options) {
                  const optionValues = variant.option_values.map((ov) => ({
                    variant_id: createdVariant.id,
                    option_id: options.find((o) => o.id === ov.option_id)?.id,
                    option_value_id: ov.value_id,
                  }));

                  await supabase
                    .from("variant_option_values")
                    .insert(optionValues);
                }
              }
            }
          }

          // Create attributes
          if (data.attributes.length > 0) {
            await supabase.from("product_attributes").insert(
              data.attributes.map((attr) => ({
                product_id: product.id,
                name: attr.name,
                value: attr.value,
              }))
            );
          }
        }
      }

      toast.success(
        isEditing
          ? "Product updated successfully"
          : "Product created successfully"
      );
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        isEditing ? "Error updating product" : "Error creating product"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    const fields = STEPS[currentStep].fields as Array<keyof ProductFormData>;
    const isValid = await form.trigger(fields);

    if (!isValid) return;

    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="space-y-10 md:space-y-20">
      <Steps
        steps={STEPS}
        currentStep={currentStep}
        onChange={(step) => {
          // Only allow going back or to completed steps
          if (step < currentStep) {
            setCurrentStep(step);
          }
        }}
      />

      <Card className="p-2 md:p-6 max-md:border-transparent max-md:shadow-none">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {currentStep === 0 && (
              <BasicDetailsForm form={form} categories={categories} />
            )}

            {currentStep === 1 && <MediaForm form={form} />}

            {currentStep === 2 && <VariantsForm form={form} />}

            {currentStep === 3 && <AttributesForm form={form} />}

            {currentStep === 4 && <SEOForm form={form} />}

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {currentStep === STEPS.length - 1 ? (
                  isEditing ? (
                    "Update Product"
                  ) : (
                    "Create Product"
                  )
                ) : (
                  <>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </FormProvider>
      </Card>
    </div>
  );
}
