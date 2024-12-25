"use client";

import {
  LayoutDashboard,
  Package,
  Users,
  Settings2,
  Boxes,
  ShoppingCart,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import { AppUser } from "@/supabase/types";

const navItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: "Products",
    url: "/admin/products",
    icon: Package,
    items: [
      {
        title: "All Products",
        url: "/admin/products",
      },
      {
        title: "Categories",
        url: "/admin/products/categories",
      },
      {
        title: "Inventory",
        url: "/admin/products/inventory",
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
    title: "Users",
    url: "/admin/users",
    icon: Users,
    items: [
      {
        title: "All Users",
        url: "/admin/users",
      },
      {
        title: "Roles",
        url: "/admin/users/roles",
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
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Boxes className="h-4 w-4" />
          </div>
          <div className="grid flex-1">
            <span className="text-lg font-semibold">Admin</span>
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
