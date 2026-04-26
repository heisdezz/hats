import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  id: string;
  amount: number;
}

type CartMap = Record<string, CartItem>;

interface CartState {
  cartItems: CartMap;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateAmount: (itemId: string, amount: number) => void;
  inCart: (itemId: string) => boolean;
  clearCart: () => void;
}

export const cartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: {},
      addItem: (item) =>
        set((state) => ({
          cartItems: { ...state.cartItems, [item.id]: item },
        })),
      removeItem: (itemId) =>
        set((state) => {
          const { [itemId]: _, ...rest } = state.cartItems;
          return { cartItems: rest };
        }),
      updateAmount: (itemId, amount) =>
        set((state) => ({
          cartItems: {
            ...state.cartItems,
            [itemId]: { ...state.cartItems[itemId], amount },
          },
        })),
      inCart: (itemId) => itemId in get().cartItems,
      clearCart: () => set({ cartItems: {} }),
    }),
    { name: "cart-store" },
  ),
);
