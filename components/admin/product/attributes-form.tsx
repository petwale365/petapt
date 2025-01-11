// components/admin/products/attributes-form.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { X } from "lucide-react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { ProductFormData } from "./types";

interface AttributesFormProps {
  form: UseFormReturn<ProductFormData>;
}

export function AttributesForm({ form }: AttributesFormProps) {
  const [newAttribute, setNewAttribute] = useState({
    name: "",
    value: "",
  });

  const attributes = form.watch("attributes") || [];

  const addAttribute = () => {
    if (!newAttribute.name || !newAttribute.value) return;

    form.setValue("attributes", [
      ...attributes,
      {
        name: newAttribute.name.toLowerCase().replace(/\s+/g, "_"),
        value: newAttribute.value,
      },
    ]);

    // Reset input
    setNewAttribute({ name: "", value: "" });
  };

  const removeAttribute = (index: number) => {
    const newAttributes = [...attributes];
    newAttributes.splice(index, 1);
    form.setValue("attributes", newAttributes);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Attribute Name</Label>
          <Input
            placeholder="e.g., Protein Content, Weight, Size"
            value={newAttribute.name}
            onChange={(e) =>
              setNewAttribute((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Value</Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., 32%, 1.5kg, Large"
              value={newAttribute.value}
              onChange={(e) =>
                setNewAttribute((prev) => ({ ...prev, value: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addAttribute();
                }
              }}
            />
            <Button
              type="button"
              onClick={addAttribute}
              disabled={!newAttribute.name || !newAttribute.value}
            >
              Add
            </Button>
          </div>
        </div>
      </div>

      {attributes.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Attribute</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attributes.map((attr, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {attr.name
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </TableCell>
                <TableCell>{attr.value}</TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttribute(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
