import { useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { readJson, writeJson } from '@/lib/storage';
import type { CartItem } from '../types';
import { cartReducer } from '../utils/cartReducer';
import { CartContext, type CartContextValue } from './cartContext';

const cartStorageKey = 'cart';

const isCartItem = (value: unknown): value is CartItem =>
  typeof value === 'object' &&
  value !== null &&
  'productId' in value &&
  'quantity' in value &&
  'price' in value &&
  typeof value.productId === 'string' &&
  typeof value.quantity === 'number' &&
  typeof value.price === 'number';

/** Stored data is untrusted (edited by hand, older app versions) — keep only valid items. */
const loadCart = (): CartItem[] => {
  const stored = readJson<unknown>(cartStorageKey, []);
  return Array.isArray(stored) ? stored.filter(isCartItem) : [];
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, loadCart);

  useEffect(() => {
    writeJson(cartStorageKey, items);
  }, [items]);

  // Keep tabs in sync; otherwise the last tab to write silently overwrites the others' cart.
  // Writing an identical value doesn't fire `storage`, so this can't ping-pong between tabs.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== cartStorageKey) return;
      dispatch({ type: 'replace', items: loadCart() });
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      addItem: (item) => dispatch({ type: 'add', item }),
      setQuantity: (productId, quantity) => dispatch({ type: 'setQuantity', productId, quantity }),
      removeItem: (productId) => dispatch({ type: 'remove', productId }),
      clearCart: () => dispatch({ type: 'clear' }),
      refreshFromCatalogue: (latest) => dispatch({ type: 'refresh', latest }),
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
