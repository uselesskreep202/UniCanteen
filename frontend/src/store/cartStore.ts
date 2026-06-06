import { create } from "zustand";
import type { CartItem, Dish } from "../types";

interface CartState {
  items: CartItem[];
  addItem: (dish: Dish) => void;
  removeItem: (dishId: number) => void;
  updateQuantity: (dishId: number, quantity: number) => void;
  clear: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (dish) => {
    const items = get().items;
    const existing = items.find((i) => i.dish.id === dish.id);
    if (existing) {
      set({ items: items.map((i) => i.dish.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i) });
    } else {
      set({ items: [...items, { dish, quantity: 1 }] });
    }
  },
  removeItem: (dishId) => set({ items: get().items.filter((i) => i.dish.id !== dishId) }),
  updateQuantity: (dishId, quantity) => {
    if (quantity <= 0) {
      set({ items: get().items.filter((i) => i.dish.id !== dishId) });
    } else {
      set({ items: get().items.map((i) => i.dish.id === dishId ? { ...i, quantity } : i) });
    }
  },
  clear: () => set({ items: [] }),
  total: () => get().items.reduce((sum, i) => sum + i.dish.price * i.quantity, 0),
}));
