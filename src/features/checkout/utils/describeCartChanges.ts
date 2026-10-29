import type { CartItem, CatalogueSnapshot } from '@/features/cart';
import { formatCurrency } from '@/utils/formatCurrency';

/** Customer-facing notes on how the live catalogue differs from the cart. Pure. */
export function describeCartChanges(
  items: CartItem[],
  latest: Record<string, CatalogueSnapshot | null>,
): string[] {
  return items.flatMap((item) => {
    const snapshot = latest[item.productId];
    if (snapshot === undefined) return [];
    if (snapshot === null) return [`${item.name} is no longer available and was removed.`];
    if (snapshot.countInStock <= 0) return [`${item.name} is sold out and was removed.`];

    const notes: string[] = [];
    if (item.quantity > snapshot.countInStock) {
      notes.push(`Only ${snapshot.countInStock} of ${item.name} left; quantity updated.`);
    }
    if (snapshot.price !== item.price) {
      notes.push(
        `${item.name} now costs ${formatCurrency(snapshot.price)} (was ${formatCurrency(item.price)}).`,
      );
    }
    return notes;
  });
}
