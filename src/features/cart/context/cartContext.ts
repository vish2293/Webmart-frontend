import { createContext } from 'react';
import type { CartItem, CatalogueSnapshot } from '../types';

export type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  /** Apply live price/stock; `null` removes a product that no longer exists. */
  refreshFromCatalogue: (latest: Record<string, CatalogueSnapshot | null>) => void;
};

export const CartContext = createContext<CartContextValue | null>(null);
