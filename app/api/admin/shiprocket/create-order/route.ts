// app/api/admin/shiprocket/create-order/route.ts
import { NextResponse } from "next/server";
import { shiprocketRequest } from "@/utils/shiprocket/shiprocket";
import { createClient } from "@/utils/supabase/server";
import { Order } from "@/supabase/types";

export async function POST(request: Request) {
  try {
    // 1. Verify admin authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || userData?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    // 2. Get order data from request
    const { orderData, supabaseOrderId } = await request.json();

    if (!orderData || !supabaseOrderId) {
      return NextResponse.json(
        { error: "Missing required data: orderData or supabaseOrderId" },
        { status: 400 }
      );
    }

    console.log(
      "Creating Shiprocket order for Supabase order ID:",
      supabaseOrderId
    );

    // First, verify the order exists in our database
    const { data: existingOrder, error: existingOrderError } = await supabase
      .from("orders")
      .select("id, order_number, status")
      .eq("id", supabaseOrderId)
      .single();

    if (existingOrderError || !existingOrder) {
      console.error(
        "Order not found in database:",
        existingOrderError || supabaseOrderId
      );
      return NextResponse.json(
        { error: "Order not found in database" },
        { status: 404 }
      );
    }

    console.log("Found order in database:", existingOrder);

    // 3. Call Shiprocket API to create the order
    const shiprocketResponse = await shiprocketRequest("/orders/create/adhoc", {
      method: "POST",
      body: JSON.stringify(orderData),
    });

    console.log("Shiprocket response:", shiprocketResponse);

    // 4. Update order in Supabase with Shiprocket data
    if (shiprocketResponse) {
      try {
        // Extract relevant data from Shiprocket response
        const shiprocketOrderId = shiprocketResponse.order_id;
        const shipmentId = shiprocketResponse.shipment_id;

        // Map Shiprocket status to your database status
        let orderStatus = "processing";
        if (shiprocketResponse.status === "CANCELED") {
          orderStatus = "cancelled";
        } else if (shiprocketResponse.status === "DELIVERED") {
          orderStatus = "delivered";
        } else if (shiprocketResponse.status === "SHIPPED") {
          orderStatus = "shipped";
        }

        const trackingNumber = shiprocketResponse.awb_code || null;
        const courierName = shiprocketResponse.courier_name || null;

        console.log("Updating Supabase order with:", {
          status: orderStatus,
          shiprocket_order_id: shiprocketOrderId,
          shipment_id: shipmentId,
          tracking_number: trackingNumber,
          courier_name: courierName,
          pickup_location: orderData.pickup_location,
          length: orderData.length,
          breadth: orderData.breadth,
          height: orderData.height,
          weight: orderData.weight,
        });

        // Perform the update with explicit error checking
        const { data: updatedOrders, error: updateError } = await supabase
          .from("orders")
          .update({
            status: orderStatus as Order["status"],
            shiprocket_order_id: shiprocketOrderId,
            shipment_id: shipmentId,
            tracking_number: trackingNumber,
            courier_name: courierName,
            pickup_location: orderData.pickup_location,
            length:
              typeof orderData.length === "string"
                ? parseFloat(orderData.length)
                : orderData.length,
            breadth:
              typeof orderData.breadth === "string"
                ? parseFloat(orderData.breadth)
                : orderData.breadth,
            height:
              typeof orderData.height === "string"
                ? parseFloat(orderData.height)
                : orderData.height,
            weight:
              typeof orderData.weight === "string"
                ? parseFloat(orderData.weight)
                : orderData.weight,
            updated_at: new Date().toISOString(),
          })
          .eq("id", supabaseOrderId)
          .select();

        if (updateError) {
          console.error("Failed to update order in database:", updateError);
          return NextResponse.json(
            {
              error:
                "Order created in Shiprocket but failed to update database",
              dbError: updateError.message,
              shiprocketResponse,
            },
            { status: 500 }
          );
        }

        // Check if any rows were actually updated
        if (!updatedOrders || updatedOrders.length === 0) {
          console.error(
            "No rows were updated in the database despite no error being returned"
          );

          // Try an alternative update approach
          const { error: alternativeUpdateError } = await supabase.rpc(
            "update_order_with_shipping",
            {
              order_id: supabaseOrderId,
              new_status: orderStatus,
              sr_order_id: shiprocketOrderId,
              sr_shipment_id: shipmentId,
              sr_tracking: trackingNumber,
              sr_courier: courierName,
              pickup_loc: orderData.pickup_location,
              pkg_length:
                typeof orderData.length === "string"
                  ? parseFloat(orderData.length)
                  : orderData.length,
              pkg_breadth:
                typeof orderData.breadth === "string"
                  ? parseFloat(orderData.breadth)
                  : orderData.breadth,
              pkg_height:
                typeof orderData.height === "string"
                  ? parseFloat(orderData.height)
                  : orderData.height,
              pkg_weight:
                typeof orderData.weight === "string"
                  ? parseFloat(orderData.weight)
                  : orderData.weight,
            }
          );

          if (alternativeUpdateError) {
            console.error(
              "Alternative update also failed:",
              alternativeUpdateError
            );
            return NextResponse.json(
              {
                error: "Failed to update order after multiple attempts",
                details: alternativeUpdateError.message,
                shiprocketResponse,
              },
              { status: 500 }
            );
          }

          console.log("Order updated via RPC function");
        } else {
          console.log(
            `Successfully updated order ${supabaseOrderId} in the database:`,
            updatedOrders
          );
        }

        // 5. Return success response with both Shiprocket data and updated order
        return NextResponse.json({
          success: true,
          message: "Order created and database updated successfully",
          shiprocketData: shiprocketResponse,
          updatedOrder: updatedOrders || [],
        });
      } catch (dbError) {
        console.error("Error updating order in database:", dbError);
        return NextResponse.json(
          {
            error:
              "Order created in Shiprocket but failed during database update",
            details:
              dbError instanceof Error ? dbError.message : "Unknown error",
            shiprocketResponse,
          },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        {
          error: "Received invalid response from Shiprocket",
          shiprocketResponse,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating Shiprocket order:", error);

    // Return appropriate error response
    return NextResponse.json(
      {
        error: "Failed to create order on Shiprocket",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
