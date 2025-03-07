import { createClient } from "@/utils/supabase/server";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { AppUser } from "@/supabase/types";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userid = user?.id;

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", userid!)
    .single();

  console.log("Profile:", profile);

  return (
    <>
      <Navbar profile={profile as unknown as AppUser} />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}
