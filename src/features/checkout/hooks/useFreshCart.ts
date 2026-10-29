import { useEffect, useMemo, useState } from 'react';
import { useCart, type CatalogueSnapshot } from '@/features/cart';
import { useLatestProducts } from '@/features/products';
import { describeCartChanges } from '../utils/describeCartChanges';

/**
 * Re-checks every cart line against the live catalogue (refetched after a failed order too)
 * and applies new prices, stock caps and removals before the customer can place the order.
 */
export function useFreshCart() {
  const { items, refreshFromCatalogue } = useCart();
  const { isFetching, byId } = useLatestProducts(items.map((item) => item.productId));
  const [notices, setNotices] = useState<string[]>([]);

  // Query results are new objects every render; key on content so effects run only on change.
  const latestJson = JSON.stringify(
    Object.fromEntries(
      Object.entries(byId).map(([productId, product]) => [
        productId,
        product && {
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          countInStock: product.countInStock,
        },
      ]),
    ),
  );
  const latest = useMemo(
    () => JSON.parse(latestJson) as Record<string, CatalogueSnapshot | null>,
    [latestJson],
  );
  const changes = useMemo(
    () => (isFetching ? [] : describeCartChanges(items, latest)),
    [isFetching, items, latest],
  );

  useEffect(() => {
    // After the refresh the cart matches the catalogue, so `changes` becomes empty: no loop.
    if (changes.length === 0) return;
    setNotices(changes);
    refreshFromCatalogue(latest);
  }, [changes, latest, refreshFromCatalogue]);

  return { isChecking: isFetching, notices };
}
