import type { Product } from '../types';
import { ProductCard } from './ProductCard';

// `listing` sits beside the filters sidebar, so it gets one column fewer at each width.
const columnClasses = {
  full: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  listing: 'grid-cols-2 xl:grid-cols-3',
} as const;

type ProductGridProps = {
  products: Product[];
  columns?: keyof typeof columnClasses;
};

export function ProductGrid({ products, columns = 'full' }: ProductGridProps) {
  return (
    <div className={`grid gap-4 sm:gap-5 ${columnClasses[columns]}`}>
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
