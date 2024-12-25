"use client";

import { usePathname } from "next/navigation";
import { BreadcrumbPage } from "@/components/ui/breadcrumb";

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/products/categories": "Categories",
  "/admin/products/inventory": "Inventory",
  "/admin/orders": "Orders",
  "/admin/orders/invoices": "Invoices",
  "/admin/users": "Users",
  "/admin/users/roles": "Roles",
  "/admin/settings": "Settings",
  "/admin/settings/security": "Security",
};

export default function BreadcrumbPageUrl() {
  const pathname = usePathname();
  return <BreadcrumbPage>{pageTitles[pathname] || "Page"}</BreadcrumbPage>;
}
