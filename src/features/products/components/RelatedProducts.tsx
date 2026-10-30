import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { ProductRail } from './home/ProductRail';

const maxRelated = 10;

/**
 * "You might also like": in-stock products from the same categories as `productIds`, best rated
 * first. Renders nothing until there is something related to show.
 */
export function RelatedProducts({ productIds }: { productIds: string[] }) {
  const { data: catalogue } = useProducts();
  // Fixed at first render: adding a suggestion to the cart shouldn't make it vanish from the row.
  const [excludedIds] = useState(() => new Set(productIds));

  if (!catalogue) return null;

  const categories = new Set(
    catalogue.filter((product) => excludedIds.has(product._id)).map((product) => product.category),
  );
  const related = catalogue
    .filter(
      (product) =>
        categories.has(product.category) &&
        !excludedIds.has(product._id) &&
        product.countInStock > 0,
    )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, maxRelated);

  if (related.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="mt-12 pb-4">
      <h2 id="related-heading" className="mb-4 text-xl font-bold tracking-display text-ink">
        You might also like
      </h2>
      <ProductRail products={related} label="Related products" />
    </section>
  );
}
