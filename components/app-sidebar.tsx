"use client";

import {
  LayoutDashboard,
  Users,
  Settings2,
  Boxes,
  ShoppingCart,
  TagsIcon,
} from "lucide-react";
import { BiCategoryAlt } from "react-icons/bi";
import { BsCollection } from "react-icons/bs";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

import { AppUser } from "@/supabase/types";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
    isActive: true,
    items: [
      {
        title: "Overview",
        url: "/admin",
      },
      {
        title: "Analytics",
        url: "/admin/analytics",
      },
    ],
  },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: ShoppingCart,
    items: [
      {
        title: "All Orders",
        url: "/admin/orders",
      },
      {
        title: "Invoices",
        url: "/admin/orders/invoices",
      },
    ],
  },
  {
    title: "Products",
    url: "/admin/products",
    icon: TagsIcon,
    items: [
      {
        title: "All Products",
        url: "/admin/products",
      },
      {
        title: "New Product",
        url: "/admin/products/new",
      },

      {
        title: "Inventory",
        url: "/admin/products/inventory",
      },
    ],
  },

  {
    title: "Categories",
    url: "/admin/categories",
    icon: BiCategoryAlt,
    items: [
      {
        title: "All Categories",
        url: "/admin/categories",
      },
      {
        title: "New Category",
        url: "/admin/categories/new",
      },
    ],
  },
  {
    title: "Collections",
    url: "/admin/collections",
    icon: BsCollection,
    items: [
      {
        title: "All Collections",
        url: "/admin/collections",
      },
      {
        title: "New Collection",
        url: "/admin/collections/new",
      },
    ],
  },

  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
    items: [
      {
        title: "All Users",
        url: "/admin/users",
      },
    ],
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings2,
    items: [
      {
        title: "General",
        url: "/admin/settings",
      },
      {
        title: "Security",
        url: "/admin/settings/security",
      },
    ],
  },
];

export function AppSidebar({
  profile,
  ...props
}: React.ComponentProps<typeof Sidebar> & { profile: AppUser }) {
  const { state } = useSidebar();
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div
          className={cn(
            "flex items-center gap-2 px-4 py-2 ",
            state === "collapsed" && "items-start p-0 gap-0"
          )}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground ">
            <Boxes className="h-4 w-4" />
          </div>
          <div className="grid flex-1 ">
            <span
              className={cn(
                "text-lg font-semibold",
                state === "collapsed" && "hidden"
              )}
            >
              Admin
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>{profile && <NavUser user={profile} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
