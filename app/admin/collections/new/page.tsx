// src/app/admin/collections/new/page.tsx
import { Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/page-header";
import CollectionForm from "@/components/admin/collections/collection-form";

export const metadata = {
  title: "New Collection",
  description: "Create a new product collection",
};

export default async function CreateNewCollectionPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Create Collection"
          description="Create a new product collection"
        />
      </div>
      <Separator />
      <Suspense fallback={<div>Loading...</div>}>
        <CollectionForm />
      </Suspense>
    </div>
  );
}
