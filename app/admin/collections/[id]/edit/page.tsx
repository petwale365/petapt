// app/admin/collections/[id]/edit/page.tsx
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/page-header";
import CollectionForm from "@/components/admin/collections/collection-form";

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();

  const { data: collection, error } = await supabase
    .from("collections")
    .select("*")
    .eq("id", (await params).id)
    .single();

  if (error || !collection) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-2 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Edit Collection"
          description="Make changes to your collection"
        />
      </div>
      <Separator />
      <CollectionForm initialData={collection} />
    </div>
  );
}
