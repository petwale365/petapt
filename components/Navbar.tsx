"use client";

import Link from "next/link";
import { ShoppingCart, Heart, Shield } from "lucide-react";
import {
  Bolt,
  BookOpen,
  ChevronDown,
  Layers2,
  LogOut,
  Pin,
  UserPen,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { AppUser } from "@/supabase/types";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { PulsatingButton } from "./magic-ui/pulsating-button";
import { useUser } from "@/hooks/use-user";
import { useEffect, useRef } from "react";
import { useCart } from "@/hooks/use-cart";
import { CartSheet } from "./cart/cart-sheet";
import { useQueryClient } from "@tanstack/react-query";

interface NavbarProps {
  profile?: AppUser;
}

export default function Navbar({ profile }: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();
  const { user, isReady, isAnonymous } = useUser();
  const isCreatingAnonUser = useRef<boolean>(false);
  const queryClient = useQueryClient();

  // Cart functionality
  const { cart, toggleCart, refetch } = useCart();

  // Debug logging
  useEffect(() => {
    if (isReady) {
      console.log("Auth state in Navbar:", {
        userId: user?.id,
        isAnonymous,
        isReady,
      });
    }
  }, [isReady, user, isAnonymous]);

  // Check for anonymous user ID in localStorage after OAuth redirect
  useEffect(() => {
    const checkAnonymousCart = async () => {
      if (user && !isAnonymous) {
        const savedAnonId = localStorage.getItem("anonymous_user_id");
        if (savedAnonId) {
          console.log(
            "Found saved anonymous ID after OAuth redirect:",
            savedAnonId
          );
          try {
            await supabase.rpc("copy_anon_cart", {
              anonymous_id: savedAnonId,
            });
            console.log(
              "Successfully merged anonymous cart after OAuth redirect"
            );

            // Clear the saved ID to prevent duplicate merges
            localStorage.removeItem("anonymous_user_id");

            // Refetch cart after merge
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            refetch();
          } catch (error) {
            console.error(
              "Failed to copy anonymous cart after OAuth redirect:",
              error
            );
          }
        }
      }
    };

    if (isReady) {
      checkAnonymousCart();
    }
  }, [isReady, user, isAnonymous, supabase, queryClient, refetch]);

  // Create anonymous user if needed
  useEffect(() => {
    const createAnonymousUser = async () => {
      if (isReady && !user && !isCreatingAnonUser.current) {
        isCreatingAnonUser.current = true;

        try {
          console.log("Creating anonymous user...");
          const { data, error } = await supabase.auth.signInAnonymously();

          if (error) {
            throw error;
          }

          console.log("Anonymous user created successfully:", data.user?.id);

          // Invalidate queries to update user and cart state
          queryClient.invalidateQueries({ queryKey: ["user"] });
          queryClient.invalidateQueries({ queryKey: ["cart"] });
        } catch (err) {
          console.error("Failed to create anonymous user:", err);
        } finally {
          isCreatingAnonUser.current = false;
        }
      }
    };

    createAnonymousUser();
  }, [isReady, user, supabase, queryClient]);

  const handleLogout = async () => {
    try {
      console.log("Logging out...");

      // First invalidate all related queries
      queryClient.removeQueries({ queryKey: ["user"] });
      queryClient.removeQueries({ queryKey: ["cart"] });

      // Then sign out
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      console.log("Successfully logged out");

      // Clear any cached anonymous user ID
      localStorage.removeItem("anonymous_user_id");

      // Refresh routes and show success message
      router.refresh();
      toast("Logged out successfully!", {
        description: "You have been logged out successfully.",
        action: {
          label: "Login",
          onClick: () => {
            router.push("/login");
          },
        },
      });

      // Create anonymous user automatically
      setTimeout(() => {
        if (!isCreatingAnonUser.current) {
          supabase.auth.signInAnonymously().then(() => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            refetch();
          });
        }
      }, 300);
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("There was a problem logging out");
    }
  };

  return (
    <>
      <nav className="fixed top-0 w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="ml-2 text-xl font-bold italic">PETAPT</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/products"
                className="text-gray-600 hover:text-primary"
              >
                Products
              </Link>
              <Link
                href="/categories"
                className="text-gray-600 hover:text-primary"
              >
                Categories
              </Link>
              <Link
                href="/collections"
                className="text-gray-600 hover:text-primary"
              >
                Collections
              </Link>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-6">
              <Link
                href="/wishlist"
                className="text-gray-600 hover:text-primary group transition-all duration-500 ease-in-out"
              >
                <Heart className="h-6 w-6 group-hover:fill-primary" />
              </Link>

              {/* Cart Icon - Updated with count from hook */}
              <button
                onClick={toggleCart}
                className="text-gray-600 hover:text-gray-900 relative"
                aria-label="Open cart"
              >
                <ShoppingCart className="h-6 w-6" />
                {cart.summary.itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                    {cart.summary.itemCount > 99
                      ? "99+"
                      : cart.summary.itemCount}
                  </span>
                )}
              </button>

              {profile && !isAnonymous ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-auto p-0 hover:bg-transparent"
                    >
                      <Avatar>
                        <AvatarImage
                          src={profile.avatar_url || "./avatar.jpg"}
                          alt="Profile image"
                        />
                        <AvatarFallback>
                          {profile.email?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown
                        size={16}
                        strokeWidth={2}
                        className="ms-2 opacity-60"
                        aria-hidden="true"
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="max-w-64">
                    <DropdownMenuLabel className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium text-foreground">
                        {profile.email}
                      </span>
                      <span className="truncate text-xs font-normal text-muted-foreground">
                        {profile.email}
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <Bolt
                          size={16}
                          strokeWidth={2}
                          className="opacity-60 mr-2"
                          aria-hidden="true"
                        />
                        <span>My Orders</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Layers2
                          size={16}
                          strokeWidth={2}
                          className="opacity-60 mr-2"
                          aria-hidden="true"
                        />
                        <span>Wishlist</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BookOpen
                          size={16}
                          strokeWidth={2}
                          className="opacity-60 mr-2"
                          aria-hidden="true"
                        />
                        <span>Purchase History</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <Pin
                          size={16}
                          strokeWidth={2}
                          className="opacity-60 mr-2"
                          aria-hidden="true"
                        />
                        <span>Saved Addresses</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <UserPen
                          size={16}
                          strokeWidth={2}
                          className="opacity-60 mr-2"
                          aria-hidden="true"
                        />
                        <span>Account Settings</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    {profile.role === "admin" && (
                      <DropdownMenuItem
                        className="text-red-600 cursor-pointer"
                        onClick={() => {
                          router.push("/admin");
                        }}
                      >
                        <Shield
                          size={16}
                          strokeWidth={2}
                          className="opacity-60 mr-2"
                          aria-hidden="true"
                        />
                        <span>Admin Dashboard</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-red-600 cursor-pointer"
                      onClick={handleLogout}
                    >
                      <LogOut
                        size={16}
                        strokeWidth={2}
                        className="opacity-60 mr-2"
                        aria-hidden="true"
                      />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <PulsatingButton className="whitespace-nowrap">
                    Login
                  </PulsatingButton>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Cart Sheet component */}
      <CartSheet />
    </>
  );
}
