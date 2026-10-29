import { Link, useParams } from 'react-router-dom';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { ApiError, getErrorMessage } from '@/lib/httpClient';
import { formatCurrency } from '@/utils/formatCurrency';
import { WishlistButton } from '@/features/wishlist';
import { ReviewsSection } from '@/features/reviews';
import { ProductGrid } from '../components/ProductGrid';
import { RatingStars } from '../components/RatingStars';
import { AddToCartControl } from '../components/AddToCartControl';
import { useProduct, useProducts } from '../hooks/useProducts';
import type { Product } from '../types';

const relatedCount = 4;
const lowStockThreshold = 5;

export default function ProductDetailPage() {
  const { productId = '' } = useParams();
  const productQuery = useProduct(productId);

  if (productQuery.isPending) return <LoadingState label="Loading product…" />;
  if (productQuery.isError) {
    const isNotFound =
      productQuery.error instanceof ApiError && [400, 404].includes(productQuery.error.status);
    return (
      <ErrorState
        title={isNotFound ? 'Product not found' : undefined}
        message={
          isNotFound
            ? 'This product may have been removed or the link is wrong.'
            : getErrorMessage(productQuery.error)
        }
        onRetry={isNotFound ? undefined : () => productQuery.refetch()}
        action={
          <ButtonLink to="/products" variant="secondary">
            Back to shop
          </ButtonLink>
        }
      />
    );
  }

  return <ProductDetail product={productQuery.data} />;
}

function StockStatus({ countInStock }: { countInStock: number }) {
  if (countInStock <= 0) {
    return <p className="text-sm font-medium text-red-700">Sold out</p>;
  }
  return (
    <p className="flex items-center gap-2 text-sm text-ink">
      <span aria-hidden className="h-2 w-2 rounded-full bg-green-600" />
      {countInStock <= lowStockThreshold ? `Only ${countInStock} left` : 'In stock'}
    </p>
  );
}

function ProductDetail({ product }: { product: Product }) {
  const categoryPath = `/products?category=${encodeURIComponent(product.category)}`;

  return (
    <div className="container pt-6 sm:pt-8">
      <nav aria-label="Breadcrumb" className="mb-6 text-[13px] text-graphite">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link to="/products" className="hover:text-ink">
              Shop
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link to={categoryPath} className="hover:text-ink">
              {product.category}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="truncate text-ink">
            {product.name}
          </li>
        </ol>
      </nav>

      <article className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="overflow-hidden rounded-2xl bg-mist">
          <ImageWithFallback
            src={product.imageUrl}
            alt={product.name}
            loading="eager"
            className="aspect-square w-full object-cover"
          />
        </div>

        <div className="lg:py-4">
          <h1 className="text-[28px] font-bold leading-tight tracking-display text-ink sm:text-[32px]">
            {product.name}
          </h1>
          <div className="mt-3">
            <RatingStars rating={product.rating} reviewCount={product.reviews} />
          </div>
          <p className="mt-6 text-2xl font-bold tabular-nums text-ink">
            {formatCurrency(product.price)}
          </p>

          <div className="mt-6 border-t border-line pt-6">
            <StockStatus countInStock={product.countInStock} />
            <div className="mt-4 flex flex-wrap gap-2.5">
              <AddToCartControl product={product} className="sm:w-56" />
              <WishlistButton product={product} variant="inline" />
              <ButtonLink to="/cart" size="lg" variant="secondary">
                Go to cart
              </ButtonLink>
            </div>
          </div>

          <div className="mt-8 border-t border-line pt-6">
            <h2 className="text-sm font-semibold text-ink">About this product</h2>
            <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-graphite">
              {product.description}
            </p>
          </div>
        </div>
      </article>

      <ReviewsSection productId={product._id} average={product.rating} />

      <RelatedProducts product={product} />
    </div>
  );
}

function RelatedProducts({ product }: { product: Product }) {
  const { data } = useProducts({ category: product.category });
  const related = data?.filter((candidate) => candidate._id !== product._id).slice(0, relatedCount);

  if (!related?.length) return null;

  return (
    <section className="mt-20" aria-labelledby="related-heading">
      <h2 id="related-heading" className="mb-6 text-xl font-bold tracking-display text-ink">
        More in {product.category}
      </h2>
      <ProductGrid products={related} />
    </section>
  );
}
