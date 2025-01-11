"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createClient } from "@/utils/supabase/client";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

import React from "react";
import { toast } from "sonner";
import { Product } from "./columns";

const DeleteProductDialog = ({ row }: { row: Row<Product> }) => {
  const router = useRouter();
  const supabase = createClient();
  const handleDeleteProduct = async () => {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", row.original.id);
      if (error) throw error;
      toast.success("Product deleted successfully");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error deleting product");
    }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger className="text-red-600">
        Delete Product
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            product.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleDeleteProduct}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteProductDialog;
