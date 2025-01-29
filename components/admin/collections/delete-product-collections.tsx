import { Trash2Icon } from "lucide-react";

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
import React from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DeleteProductCollectionsProps {
  productId: string;
  collectionId: string;
}

const DeleteProductCollections = ({
  productId,
  collectionId,
}: DeleteProductCollectionsProps) => {
  const supabase = createClient();
  const router = useRouter();

  const handleDeleteProduct = async () => {
    try {
      const { error } = await supabase
        .from("product_collections")
        .delete()
        .eq("product_id", productId)
        .eq("collection_id", collectionId);
      if (error) throw error;
      toast.success("Product Removed from Collection");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error deleting product");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Trash2Icon className="h-4 w-4 text-red-600" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove the product from this collection.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleDeleteProduct}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteProductCollections;
