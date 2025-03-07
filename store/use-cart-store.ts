// src/store/useCartStore.ts
import { create } from "zustand";
import { CartItemWithProductDetails, CartSummary } from "@/supabase/types";

interface CartState {
  // Cart items with detailed product info
  items: CartItemWithProductDetails[];
  // Cart summary with totals
  summary: CartSummary;
  // UI state
  isCartOpen: boolean;

  // Actions
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Cart state management
  setItems: (items: CartItemWithProductDetails[]) => void;
}

// Helper function to calculate cart summary
const calculateSummary = (items: CartItemWithProductDetails[]): CartSummary => {
  return {
    subtotal: items.reduce((total, item) => {
      const price = item.variant?.price || item.product.base_price;
      return total + price * item.quantity;
    }, 0),
    itemCount: items.reduce((count, item) => count + item.quantity, 0),
  };
};

export const useCartStore = create<CartState>()((set) => ({
  items: [],
  summary: {
    subtotal: 0,
    itemCount: 0,
  },
  isCartOpen: false,

  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  setItems: (items) => {
    const summary = calculateSummary(items);
    set({ items, summary });
  },
}));
