import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { formatCurrency } from '@/utils/formatCurrency';
import type { Product } from '../types';
import { AddToCartControl } from './AddToCartControl';

const lowStockThreshold = 5;

function StockBadge({ countInStock }: { countInStock: number }) {
  if (countInStock <= 0) {
    return (
      <span className="absolute left-3 top-3 rounded-md bg-white px-2 py-1 text-xs font-semibold text-ink">
        Sold out
      </span>
    );
  }
  if (countInStock <= lowStockThreshold) {
    return (
      <span className="absolute left-3 top-3 rounded-md bg-brand-400 px-2 py-1 text-xs font-semibold text-ink">
        Only {countInStock} left
      </span>
    );
  }
  return null;
}

export function ProductCard({ product }: { product: Product }) {
  const detailPath = `/products/${product._id}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-line bg-white transition-colors hover:border-zinc-300">
      <Link to={detailPath} tabIndex={-1} aria-hidden className="relative block bg-mist">
        <ImageWithFallback
          src={product.imageUrl}
          alt=""
          className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <StockBadge countInStock={product.countInStock} />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink">
          <Link
            to={detailPath}
            className="decoration-brand-400 decoration-2 underline-offset-4 hover:underline"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-graphite">
          {product.description}
        </p>
        {product.reviews > 0 && (
          <p className="mt-2 flex items-center gap-1 text-[13px]">
            <Star size={13} className="fill-brand-400 text-brand-400" aria-hidden />
            <span className="font-semibold text-ink">{product.rating.toFixed(1)}</span>
            <span className="text-graphite">({product.reviews})</span>
            <span className="sr-only">reviews</span>
          </p>
        )}

        {/* mt-auto pins the price row to the bottom so a row of cards lines up. */}
        <div className="mt-auto pt-3">
          <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
            <p className="text-base font-bold tabular-nums text-ink">
              {formatCurrency(product.price)}
            </p>
            <AddToCartControl product={product} variant="compact" className="shrink-0" />
          </div>
        </div>
      </div>
    </article>
  );
}
