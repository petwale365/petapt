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

interface NavbarProps {
  profile?: AppUser;
}

export default function Navbar({ profile }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
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
  };

  return (
    <nav className="fixed top-0 w-full bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            {/* <Image
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="h-8 w-auto"
            /> */}
            <span className="ml-2 text-xl font-bold italic">PETAPT</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-gray-600 hover:text-primary">
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
            <Link
              href="/cart"
              className="text-gray-600 hover:text-gray-900 relative"
            >
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                0
              </span>
            </Link>

            {profile ? (
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
                  {/* <DropdownMenuSeparator /> */}
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
  );
}
