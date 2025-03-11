// app/checkout/components/address-form-dialog.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/hooks/use-user";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Address } from "@/supabase/types";

// Define schema for form validation
const addressSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  address_line1: z.string().min(1, "Address line 1 is required"),
  address_line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  is_default: z.boolean().default(false),
  type: z.enum(["shipping", "billing"]).default("shipping"),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressFormDialogProps {
  open: boolean;
  onClose: () => void;
  onAddressCreated: (address: Address) => void;
}

export default function AddressFormDialog({
  open,
  onClose,
  onAddressCreated,
}: AddressFormDialogProps) {
  const { user } = useUser();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "India",
      phone: "",
      is_default: false,
      type: "shipping",
    },
  });

  const onSubmit = async (data: AddressFormValues) => {
    if (!user) {
      toast.error("You must be logged in to add an address");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: newAddress, error } = await supabase
        .from("addresses")
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // If this is set as default, update other addresses to not be default
      if (data.is_default) {
        const { error: updateError } = await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", user.id)
          .neq("id", newAddress.id);

        if (updateError) {
          console.error("Error updating other addresses:", updateError);
        }
      }

      toast.success("Address added successfully");
      onAddressCreated(newAddress);
      reset();
    } catch (error) {
      console.error("Error adding address:", error);
      toast.error("Failed to add address. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle dialog close - reset form
  const handleDialogClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Address</DialogTitle>
          <DialogDescription>
            Add a new delivery address to your account
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                {...register("first_name")}
                aria-invalid={!!errors.first_name}
              />
              {errors.first_name && (
                <p className="text-sm text-destructive">
                  {errors.first_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                {...register("last_name")}
                aria-invalid={!!errors.last_name}
              />
              {errors.last_name && (
                <p className="text-sm text-destructive">
                  {errors.last_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                {...register("phone")}
                aria-invalid={!!errors.phone}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Address Type</Label>
              <Select
                defaultValue="shipping"
                onValueChange={(value) =>
                  setValue("type", value as "shipping" | "billing")
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shipping">Shipping</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_line1">Address Line 1</Label>
            <Input
              id="address_line1"
              {...register("address_line1")}
              aria-invalid={!!errors.address_line1}
            />
            {errors.address_line1 && (
              <p className="text-sm text-destructive">
                {errors.address_line1.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_line2">
              Address Line 2{" "}
              <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Input id="address_line2" {...register("address_line2")} />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                {...register("city")}
                aria-invalid={!!errors.city}
              />
              {errors.city && (
                <p className="text-sm text-destructive">
                  {errors.city.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                {...register("state")}
                aria-invalid={!!errors.state}
              />
              {errors.state && (
                <p className="text-sm text-destructive">
                  {errors.state.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                {...register("postal_code")}
                aria-invalid={!!errors.postal_code}
              />
              {errors.postal_code && (
                <p className="text-sm text-destructive">
                  {errors.postal_code.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              {...register("country")}
              aria-invalid={!!errors.country}
            />
            {errors.country && (
              <p className="text-sm text-destructive">
                {errors.country.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_default"
              //   checked={register("is_default")}

              onCheckedChange={(checked) => {
                setValue("is_default", checked === true);
              }}
            />
            <Label
              htmlFor="is_default"
              className="text-sm font-normal cursor-pointer"
            >
              Set as default address
            </Label>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleDialogClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Address"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
