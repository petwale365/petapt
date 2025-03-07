// components/AuthStateListener.tsx
"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AuthStateListener() {
  const supabase = createClient();

  useEffect(() => {
    // Check for anonymous ID immediately (for cases like after a refresh)
    const checkAnonymousId = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && !user.app_metadata.is_anonymous) {
        const anonymousId = localStorage.getItem("anonymousUserId");

        if (anonymousId) {
          try {
            const { error } = await supabase.rpc("copy_anon_cart", {
              anonymous_id: anonymousId,
            });

            if (error) {
              console.error("Error merging cart data:", error);
            } else {
              console.log("Successfully merged cart data");
              localStorage.removeItem("anonymousUserId");
            }
          } catch (err) {
            console.error("Error executing cart merge:", err);
          }
        }
      }
    };

    checkAnonymousId();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Only run on sign in events
      if (event === "SIGNED_IN") {
        // Don't run for anonymous sign-ins
        if (session && !session.user.app_metadata.is_anonymous) {
          const anonymousId = localStorage.getItem("anonymousUserId");

          if (anonymousId) {
            try {
              const { error } = await supabase.rpc("copy_anon_cart", {
                anonymous_id: anonymousId,
              });

              if (error) {
                console.error("Error merging cart data:", error);
              } else {
                console.log("Successfully merged cart data");
                localStorage.removeItem("anonymousUserId");
              }
            } catch (err) {
              console.error("Error executing cart merge:", err);
            }
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return null; // This component doesn't render anything
}
