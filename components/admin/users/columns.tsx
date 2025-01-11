"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { RoleSelect } from "./role-select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

export type UserColumn = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: string;
  created_at: string;
  last_login_at: string | null;
  addresses: {
    id: string;
    address_line1: string;
    address_line2: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string;
    is_default: boolean;
    type: "billing" | "shipping";
  }[];
};

const AddressList = ({ addresses }: { addresses: UserColumn["addresses"] }) => {
  if (!addresses?.length) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {addresses.map((address) => (
        <Card key={address.id} className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      address.type === "shipping" ? "default" : "secondary"
                    }
                  >
                    {address.type}
                  </Badge>
                  {address.is_default && (
                    <Badge variant="outline">Default</Badge>
                  )}
                </div>
                <div className="space-y-1 text-sm">
                  <p>{address.address_line1}</p>
                  {address.address_line2 && <p>{address.address_line2}</p>}
                  <p>
                    {address.city}, {address.state} {address.postal_code}
                  </p>
                  <p>{address.country}</p>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{address.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const AvatarCell = ({ user }: { user: UserColumn }) => {
  // Check if avatar_url is a valid URL before using it
  const isValidUrl = (url: string | null) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <>
      {isValidUrl(user.avatar_url) ? (
        <div className="relative h-8 w-8 rounded-full overflow-hidden">
          <Image
            src={user.avatar_url || ""}
            alt={user.full_name || ""}
            className="object-cover"
            fill
            sizes="32px"
          />
        </div>
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </>
  );
};

export const columns: ColumnDef<UserColumn>[] = [
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isOpen, setIsOpen] = useState(false);
      const hasAddresses = row.original.addresses?.length > 0;

      if (!hasAddresses) return null;

      return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="p-0">
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 py-2">
            <AddressList addresses={row.original.addresses} />
          </CollapsibleContent>
        </Collapsible>
      );
    },
  },
  {
    accessorKey: "full_name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        User
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const hasAddresses = row.original.addresses?.length > 0;

      return (
        <div className="flex items-center gap-2 min-w-[200px]">
          <AvatarCell user={row.original} />
          <div className="flex flex-col">
            <span className="font-medium">
              {row.original.full_name || "No name"}
            </span>
            <span className="text-sm text-muted-foreground">
              {row.original.email}
            </span>
          </div>
          {hasAddresses && (
            <Badge variant="outline" className="ml-2">
              <MapPin className="mr-1 h-3 w-3" />
              {row.original.addresses.length}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => <RoleSelect user={row.original} />,
  },
  {
    accessorKey: "phone",
    header: "Contact",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        {row.original.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{row.original.phone}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-3 w-3" />
          <span>{row.original.email}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Joined
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex flex-col gap-1 text-sm">
        <span>{format(new Date(row.original.created_at), "MMM d, yyyy")}</span>
        {row.original.last_login_at && (
          <span className="text-muted-foreground">
            Last login:{" "}
            {format(new Date(row.original.last_login_at), "MMM d, yyyy")}
          </span>
        )}
      </div>
    ),
  },
];
