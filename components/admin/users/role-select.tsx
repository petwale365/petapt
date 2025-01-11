"use client";

import { useState } from "react";
import { Check, Shield } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/client";
import { UserColumn } from "./columns";

interface RoleSelectProps {
  user: UserColumn;
}

const roles = [
  {
    value: "admin",
    label: "Admin",
    description: "Full access to all features",
  },
  {
    value: "customer",
    label: "Customer",
    description: "Regular customer account",
  },
];

export function RoleSelect({ user }: RoleSelectProps) {
  const [loading, setLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState(user.role);

  const onRoleChange = async (newRole: string) => {
    if (newRole === currentRole) return;

    try {
      setLoading(true);
      const supabase = createClient();

      const { error } = await supabase
        .from("users")
        .update({ role: newRole })
        .eq("id", user.id);

      if (error) throw error;

      setCurrentRole(newRole);
      toast.success(`Role updated to ${newRole}`);
    } catch (error) {
      console.error(error);
      toast.error("Error updating role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          disabled={loading}
          className="flex items-center gap-2 px-3 font-normal"
        >
          <Badge
            variant={currentRole === "admin" ? "default" : "secondary"}
            className="font-normal"
          >
            <Shield className="mr-1 h-3 w-3" />
            {currentRole}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {roles.map((role) => (
          <DropdownMenuItem
            key={role.value}
            onClick={() => onRoleChange(role.value)}
            disabled={loading}
            className="flex items-center justify-between"
          >
            <div className="flex flex-col">
              <span>{role.label}</span>
              <span className="text-xs text-muted-foreground">
                {role.description}
              </span>
            </div>
            {currentRole === role.value && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
