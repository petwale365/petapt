"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { IconType } from "react-icons/lib";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: IconType | LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();

  const isActiveUrl = (item: (typeof items)[0]) => {
    const isMainPathActive = pathname === item.url;
    const isSubPathActive = item.items?.some(
      (subItem) => pathname === subItem.url
    );
    return isMainPathActive || isSubPathActive;
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = isActiveUrl(item);

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isActive || item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={cn(
                      isActive &&
                        "text-violet-600 dark:text-violet-400 font-medium"
                    )}
                    asChild={!item.items}
                  >
                    {!item.items ? (
                      <Link
                        href={item.url}
                        className="flex w-full items-center"
                      >
                        {item.icon && (
                          <item.icon
                            className={cn(
                              "size-4",
                              isActive && "text-violet-600 dark:text-violet-400"
                            )}
                          />
                        )}
                        <span>{item.title}</span>
                      </Link>
                    ) : (
                      <>
                        {item.icon && (
                          <item.icon
                            className={cn(
                              "size-4",
                              isActive && "text-violet-600 dark:text-violet-400"
                            )}
                          />
                        )}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </>
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {item.items && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => {
                        const isSubActive = pathname === subItem.url;

                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              className={cn(
                                isSubActive &&
                                  "text-violet-600 dark:text-violet-400 font-medium"
                              )}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
