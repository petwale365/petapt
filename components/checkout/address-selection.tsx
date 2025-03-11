"use client";

import { CheckCircle2 } from "lucide-react";
import { RadioGroup } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Address {
  id: string;
  type: string;
  first_name: string;
  last_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  is_default: boolean | null;
}

interface AddressSelectionProps {
  addresses: Address[];
  selectedAddressId: string | null;
  onSelect: (addressId: string) => void;
}

export default function AddressSelection({
  addresses,
  selectedAddressId,
  onSelect,
}: AddressSelectionProps) {
  return (
    <RadioGroup
      value={selectedAddressId || undefined}
      onValueChange={onSelect}
      className="grid gap-4 md:grid-cols-2"
    >
      {addresses.map((address) => (
        <Label
          key={address.id}
          htmlFor={address.id}
          className={`flex flex-col rounded-lg border p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
            selectedAddressId === address.id
              ? "border-primary ring-2 ring-primary/10"
              : "border-gray-200"
          }`}
        >
          <div className="flex items-start space-x-2">
            <input
              type="radio"
              id={address.id}
              value={address.id}
              className="sr-only"
              checked={selectedAddressId === address.id}
              onChange={() => onSelect(address.id)}
            />

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="font-medium text-base">
                  {address.first_name} {address.last_name}
                </div>

                {address.is_default && (
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    Default
                  </span>
                )}
              </div>

              <div className="mt-2 space-y-1 text-sm text-gray-700">
                <p>{address.address_line1}</p>
                {address.address_line2 && <p>{address.address_line2}</p>}
                <p>
                  {address.city}, {address.state} {address.postal_code}
                </p>
                <p>{address.country}</p>
                <p className="mt-1 font-medium">Phone: {address.phone}</p>
              </div>
            </div>

            {selectedAddressId === address.id && (
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
            )}
          </div>
        </Label>
      ))}
    </RadioGroup>
  );
}
