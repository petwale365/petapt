import { clsx, type ClassValue } from "clsx";

import { twMerge } from "tailwind-merge";
import { format, isValid, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(
  date: string | number | Date | null,
  formatStr: string = "PPP" // Default format: 'Apr 29, 1993'
) {
  if (!date) return "";

  let parsedDate: Date;

  if (typeof date === "string") {
    // Handle ISO strings
    parsedDate = parseISO(date);
  } else if (typeof date === "number") {
    // Handle timestamps
    parsedDate = new Date(date);
  } else {
    // Handle Date objects
    parsedDate = date;
  }

  if (!isValid(parsedDate)) {
    return "";
  }

  try {
    return format(parsedDate, formatStr);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
}

/**
 * Format a price in INR currency.
 *
 * @param price - The price to format
 * @returns A string representation of the price in INR currency
 */
export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
  }).format(price);
}
