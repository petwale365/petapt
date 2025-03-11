/*eslint-disable */
// components/admin/orders/fulfill-order-dialog.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Package2 } from "lucide-react";
import { Order } from "./columns";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";

interface FulfillOrderDialogProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PickupLocation {
  id: number;
  pickup_location: string;
  address: string;
  city: string;
  state: string;
  pin_code: string;
}

// Form validation schema
const formSchema = z.object({
  pickup_location: z.string().min(1, "Pickup location is required"),
  package_weight: z.coerce.number().min(0.01, "Weight must be greater than 0"),
  package_length: z.coerce.number().min(1, "Length must be at least 1 cm"),
  package_breadth: z.coerce.number().min(1, "Breadth must be at least 1 cm"),
  package_height: z.coerce.number().min(1, "Height must be at least 1 cm"),
  item_descriptions: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export function FulfillOrderDialog({
  order,
  open,
  onOpenChange,
}: FulfillOrderDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const supabase = createClient();

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pickup_location: "",
      package_weight: 0.5,
      package_length: 10,
      package_breadth: 10,
      package_height: 5,
      item_descriptions: order.order_items
        .map((item) => `${item.product.name} x${item.quantity}`)
        .join(", "),
    },
  });

  // Fetch pickup locations from our API route when the dialog opens
  useEffect(() => {
    if (open) {
      fetchPickupLocations();
    }
  }, [open]);

  const fetchPickupLocations = async () => {
    try {
      setIsLoadingLocations(true);
      // Use our API route instead of calling shiprocketRequest directly
      const response = await fetch("/api/admin/shiprocket/pickup-locations");

      if (!response.ok) {
        throw new Error("Failed to fetch pickup locations");
      }

      const data = await response.json();

      if (data.data && data.data.shipping_address) {
        const locations = data.data.shipping_address.map((loc: any) => ({
          id: loc.id,
          pickup_location: loc.pickup_location,
          address: loc.address,
          city: loc.city,
          state: loc.state,
          pin_code: loc.pin_code,
        }));

        setPickupLocations(locations);

        // Set default pickup location if available
        if (locations.length > 0) {
          form.setValue("pickup_location", locations[0].id.toString());
        }
      } else {
        // Handle case where no pickup locations are found
        toast.warning(
          "No pickup locations found. Please create one in your Shiprocket account."
        );
      }
    } catch (error) {
      console.error("Error fetching pickup locations:", error);
      toast.error("Failed to fetch pickup locations");
    } finally {
      setIsLoadingLocations(false);
    }
  };
  // Inside handleSubmit function in FulfillOrderDialog component
  const handleSubmit = async (data: FormValues) => {
    if (!order) return;

    startTransition(async () => {
      try {
        // Find selected pickup location details
        const selectedLocation = pickupLocations.find(
          (loc) => loc.id.toString() === data.pickup_location
        );

        if (!selectedLocation) {
          throw new Error("Invalid pickup location selected");
        }

        // 1. Prepare data for Shiprocket API
        const shiprocketOrder = {
          order_id: order.order_number,
          order_date: new Date(order.created_at).toISOString().split("T")[0],
          pickup_location: selectedLocation.pickup_location,
          channel_id: "",
          comment: data.item_descriptions,
          billing_customer_name: `${order.shipping_address.first_name} ${order.shipping_address.last_name}`,
          billing_last_name: order.shipping_address.last_name,
          billing_address: order.shipping_address.address_line1,
          billing_address_2: order.shipping_address.address_line2 || "",
          billing_city: order.shipping_address.city,
          billing_pincode: order.shipping_address.postal_code,
          billing_state: order.shipping_address.state,
          billing_country: order.shipping_address.country || "India",
          billing_email: order.user.email,
          billing_phone: order.shipping_address.phone,
          shipping_is_billing: true,
          shipping_customer_name: "",
          shipping_last_name: "",
          shipping_address: "",
          shipping_address_2: "",
          shipping_city: "",
          shipping_pincode: "",
          shipping_country: "",
          shipping_state: "",
          shipping_email: "",
          shipping_phone: "",
          order_items: order.order_items.map((item) => ({
            name: item.product.name,
            sku: item.variant_id || item.product_id.substring(0, 8),
            units: item.quantity,
            selling_price: item.unit_price.toString(),
            discount: "",
            tax: "",
          })),
          payment_method: order.payment_method === "cod" ? "COD" : "Prepaid",
          shipping_charges: 0,
          giftwrap_charges: 0,
          transaction_charges: 0,
          total_discount: 0,
          sub_total: order.total_amount,
          length: data.package_length,
          breadth: data.package_breadth,
          height: data.package_height,
          weight: data.package_weight,
        };

        // 2. Call our API route to create the order in Shiprocket
        // And pass along the Supabase order ID for updating
        const response = await fetch("/api/admin/shiprocket/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderData: shiprocketOrder,
            supabaseOrderId: order.id,
          }),
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(
            responseData.error || "Failed to create Shiprocket order"
          );
        }

        if (responseData.error) {
          throw new Error(responseData.error);
        }

        toast.success("Order sent to Shiprocket for fulfillment!");
        onOpenChange(false);

        // Refresh the page to show updated status
        window.location.reload();
      } catch (error) {
        console.error("Error fulfilling order:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to fulfill order"
        );
      }
    });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package2 className="h-5 w-5" />
            Fulfill Order #{order.order_number}
          </DialogTitle>
          <DialogDescription>
            Send this order to Shiprocket for fulfillment and shipping.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-6">
              {/* Order Details Summary */}
              <div className="rounded-md bg-muted/50 p-4">
                <h3 className="mb-2 font-medium">Order Summary</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Customer:</p>
                    <p className="font-medium">
                      {order.shipping_address.first_name}{" "}
                      {order.shipping_address.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment:</p>
                    <p className="font-medium capitalize">
                      {order.payment_method}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Items:</p>
                    <p className="font-medium">
                      {order.order_items.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      )}{" "}
                      items
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total:</p>
                    <p className="font-medium">
                      ₹{order.total_amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Shipping Info */}
              <div>
                <h3 className="mb-2 font-medium">Shipping Address</h3>
                <div className="text-sm">
                  <p>
                    {order.shipping_address.first_name}{" "}
                    {order.shipping_address.last_name}
                  </p>
                  <p>{order.shipping_address.address_line1}</p>
                  {order.shipping_address.address_line2 && (
                    <p>{order.shipping_address.address_line2}</p>
                  )}
                  <p>
                    {order.shipping_address.city},{" "}
                    {order.shipping_address.state}{" "}
                    {order.shipping_address.postal_code}
                  </p>
                  <p>{order.shipping_address.country}</p>
                  <p>Phone: {order.shipping_address.phone}</p>
                </div>
              </div>

              <Separator />

              {/* Shipping Details Form */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="pickup_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pickup Location</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isPending || isLoadingLocations}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isLoadingLocations
                                  ? "Loading locations..."
                                  : "Select pickup location"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {pickupLocations.length > 0 ? (
                            pickupLocations.map((location) => (
                              <SelectItem
                                key={location.id}
                                value={location.id.toString()}
                              >
                                {location.pickup_location} ({location.city})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>
                              No pickup locations available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {pickupLocations.length === 0 && !isLoadingLocations && (
                        <p className="text-xs text-amber-500 mt-1">
                          No pickup locations found. Please create one in your
                          Shiprocket account.
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="package_weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-2">
                    <FormField
                      control={form.control}
                      name="package_length"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Length (cm)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              disabled={isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="package_breadth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Width (cm)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              disabled={isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="package_height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height (cm)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              disabled={isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="item_descriptions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Descriptions</FormLabel>
                      <FormControl>
                        <Textarea {...field} disabled={isPending} rows={3} />
                      </FormControl>
                      <FormDescription>
                        A brief description of the items in this order
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || pickupLocations.length === 0}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Fulfill Order
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
