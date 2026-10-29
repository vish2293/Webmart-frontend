import type { CartItem, CatalogueSnapshot } from '../types';

export type CartAction =
  | { type: 'add'; item: Omit<CartItem, 'quantity'> }
  | { type: 'setQuantity'; productId: string; quantity: number }
  | { type: 'remove'; productId: string }
  | { type: 'clear' }
  /** Another tab changed the stored cart. */
  | { type: 'replace'; items: CartItem[] }
  /** Live catalogue data; `null` means the product no longer exists. */
  | { type: 'refresh'; latest: Record<string, CatalogueSnapshot | null> };

const clampQuantity = (quantity: number, countInStock: number) =>
  Math.max(1, Math.min(quantity, Math.max(countInStock, 1)));

function refreshItems(items: CartItem[], latest: Record<string, CatalogueSnapshot | null>) {
  let hasChanged = false;
  const next: CartItem[] = [];

  for (const item of items) {
    const snapshot = latest[item.productId];
    if (snapshot === undefined) {
      next.push(item); // Not fetched (yet); keep as is.
      continue;
    }
    if (snapshot === null || snapshot.countInStock <= 0) {
      hasChanged = true; // Deleted or sold out.
      continue;
    }
    const quantity = Math.min(item.quantity, snapshot.countInStock);
    const updated = { ...item, ...snapshot, quantity };
    const isSame =
      updated.name === item.name &&
      updated.price === item.price &&
      updated.imageUrl === item.imageUrl &&
      updated.countInStock === item.countInStock &&
      updated.quantity === item.quantity;
    hasChanged ||= !isSame;
    next.push(isSame ? item : updated);
  }
  // Same reference when nothing changed, so callers re-rendering on new data can't loop.
  return hasChanged ? next : items;
}

export function cartReducer(items: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'add': {
      const existing = items.find((item) => item.productId === action.item.productId);
      if (!existing) return [...items, { ...action.item, quantity: 1 }];
      return items.map((item) =>
        item.productId === action.item.productId
          ? { ...item, quantity: clampQuantity(item.quantity + 1, action.item.countInStock) }
          : item,
      );
    }
    case 'setQuantity':
      if (action.quantity < 1) return items.filter((item) => item.productId !== action.productId);
      return items.map((item) =>
        item.productId === action.productId
          ? { ...item, quantity: clampQuantity(action.quantity, item.countInStock) }
          : item,
      );
    case 'remove':
      return items.filter((item) => item.productId !== action.productId);
    case 'clear':
      return [];
    case 'replace':
      return action.items;
    case 'refresh':
      return refreshItems(items, action.latest);
  }
}
