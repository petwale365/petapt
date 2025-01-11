// components/admin/products/product-form-wrapper.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ChevronRight, ChevronLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Steps } from "./steps";

// Basic product schema - we'll expand this as we add more steps
const productSchema = z.object({
  // Step 1: Basic Details
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  base_price: z.coerce.number().min(0, "Price must be greater than 0"),
  sale_price: z.coerce.number().min(0).optional().nullable(),
  category_id: z.string().optional(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productSchema>;

const STEPS = [
  { title: "Basic Details", description: "Add basic product information" },
  { title: "Media", description: "Add product images" },
  { title: "Variants", description: "Configure product variants" },
  { title: "SEO & Attributes", description: "Add SEO and attributes" },
];

export function ProductFormWrapper() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      base_price: 0,
      sale_price: null,
      is_active: true,
      is_featured: false,
    },
  });

  const { formState } = form;

  const onSubmit = async (data: ProductFormData) => {
    if (currentStep !== STEPS.length - 1) {
      return handleNext();
    }

    try {
      setIsSubmitting(true);
      // TODO: Implement final submission
      console.log("Form data:", data);

      // Navigate back to products list
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Error creating product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    const fields = getFieldsForCurrentStep();
    const isValid = await form.trigger(fields);

    if (!isValid) return;

    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Helper to get fields that should be validated in current step
  const getFieldsForCurrentStep = (): (keyof ProductFormData)[] => {
    switch (currentStep) {
      case 0:
        return ["name", "base_price"];
      // Add validation fields for other steps
      default:
        return [];
    }
  };

  // Helper to check if current step is valid
  const isCurrentStepValid = (): boolean => {
    const fields = getFieldsForCurrentStep();
    return fields.every((field) => !formState.errors[field]);
  };

  return (
    <div className="space-y-8">
      <Steps
        steps={STEPS}
        currentStep={currentStep}
        onChange={setCurrentStep}
      />

      <Card className="p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Step content will go here */}
          {currentStep === 0 && <div>Step 1 content goes here</div>}
          {/* Add other steps */}

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

            <Button
              type="submit"
              disabled={!isCurrentStepValid() || isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {currentStep === STEPS.length - 1 ? (
                "Create Product"
              ) : (
                <>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
