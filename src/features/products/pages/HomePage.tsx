import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { LoadingState } from '@/components/feedback/LoadingState';
import { pricingRules } from '@/features/cart';
import { getErrorMessage } from '@/lib/httpClient';
import { formatCurrencyWhole } from '@/utils/formatCurrency';
import { HeroCarousel, type HeroSlide } from '../components/HeroCarousel';
import { ProductGrid } from '../components/ProductGrid';
import { useProducts } from '../hooks/useProducts';
import type { Product } from '../types';

const newInCount = 8;

const heroProductCount = 4;
const spotlightSlideCount = 3;

const byRating = (a: Product, b: Product) => b.rating - a.rating;

/** Top-rated in-stock product from each category, best first — variety over a single aisle. */
function pickAcrossCategories(inStock: Product[]) {
  const bestByCategory = new Map<string, Product>();
  for (const product of inStock) {
    const current = bestByCategory.get(product.category);
    if (!current || product.rating > current.rating) bestByCategory.set(product.category, product);
  }
  return [...bestByCategory.values()].sort(byRating).slice(0, heroProductCount);
}

function lowestPrice(products: Product[]) {
  return products.length > 0 ? Math.min(...products.map((product) => product.price)) : undefined;
}

/** Main slide, then one spotlight per category (largest in-stock range first). */
function buildHeroSlides(products: Product[]): HeroSlide[] {
  const inStock = products.filter((product) => product.countInStock > 0);
  const freeShippingOver = formatCurrencyWhole(pricingRules.freeShippingThreshold);

  const byCategory = new Map<string, Product[]>();
  for (const product of inStock) {
    byCategory.set(product.category, [...(byCategory.get(product.category) ?? []), product]);
  }
  const spotlights = [...byCategory]
    .filter(([, items]) => items.length >= 2)
    .sort(([, a], [, b]) => b.length - a.length)
    .slice(0, spotlightSlideCount)
    .map(([category, items], index): HeroSlide => ({
      id: `category-${category}`,
      tone: index % 2 === 0 ? 'dark' : 'yellow',
      heading: [category, 'top rated'],
      lead: `${category} picks from`,
      startingPrice: lowestPrice(items),
      products: [...items].sort(byRating).slice(0, heroProductCount),
      cta: { to: `/products?category=${encodeURIComponent(category)}`, label: `Shop ${category}` },
      footnote: `${items.length} products in stock`,
    }));

  return [
    {
      id: 'main',
      tone: 'yellow',
      heading: ['Good gear,', 'fairly priced'],
      lead: 'Electronics, fashion, beauty and home from',
      startingPrice: lowestPrice(inStock),
      products: pickAcrossCategories(inStock),
      cta: { to: '/products', label: 'Shop now' },
      footnote: `Free shipping over ${freeShippingOver}`,
    },
    ...spotlights,
  ];
}

type CategorySummary = { name: string; count: number; cover: Product };

/** One entry per category, using its top-rated product's image as the cover. */
function summarizeCategories(products: Product[]): CategorySummary[] {
  const byName = new Map<string, CategorySummary>();
  for (const product of products) {
    const current = byName.get(product.category);
    if (!current) {
      byName.set(product.category, { name: product.category, count: 1, cover: product });
    } else {
      current.count += 1;
      if (product.rating > current.cover.rating) current.cover = product;
    }
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function SectionHeader({
  id,
  title,
  link,
}: {
  id: string;
  title: string;
  link?: { to: string; label: string };
}) {
  return (
    <div className="mb-6 flex items-baseline justify-between gap-4">
      <h2 id={id} className="text-xl font-bold tracking-display text-ink">
        {title}
      </h2>
      {link && (
        <Link
          to={link.to}
          className="text-sm font-semibold text-ink decoration-brand-400 decoration-2 underline-offset-4 hover:underline"
        >
          {link.label}
        </Link>
      )}
    </div>
  );
}

export default function HomePage() {
  const productsQuery = useProducts();

  if (productsQuery.isPending) return <LoadingState label="Loading products…" />;
  if (productsQuery.isError) {
    return (
      <ErrorState
        message={getErrorMessage(productsQuery.error)}
        onRetry={() => productsQuery.refetch()}
      />
    );
  }

  const products = productsQuery.data;
  const categories = summarizeCategories(products);

  return (
    <>
      <HeroCarousel slides={buildHeroSlides(products)} />
      <div className="container space-y-20 pt-16">
        <section aria-labelledby="new-in-heading">
          <SectionHeader
            id="new-in-heading"
            title="New in"
            link={products.length > newInCount ? { to: '/products', label: 'View all' } : undefined}
          />
          {products.length === 0 ? (
            <p className="text-sm text-graphite">New products are on the way. Check back soon.</p>
          ) : (
            <ProductGrid products={products.slice(0, newInCount)} />
          )}
        </section>

        {categories.length > 1 && (
          <section aria-labelledby="categories-heading">
            <SectionHeader id="categories-heading" title="Shop by category" />
            {/* auto-fit keeps every category on one row on desktop, however many there are. */}
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-[repeat(auto-fit,minmax(170px,1fr))]">
              {categories.map(({ name, count, cover }) => (
                <li key={name}>
                  <Link
                    to={`/products?category=${encodeURIComponent(name)}`}
                    className="group block overflow-hidden rounded-xl border border-line bg-white transition-colors hover:border-ink"
                  >
                    <div className="overflow-hidden bg-mist">
                      <ImageWithFallback
                        src={cover.imageUrl}
                        alt=""
                        className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 px-4 py-3">
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] font-semibold text-ink">
                          {name}
                        </span>
                        <span className="block text-[13px] text-graphite">
                          {count} {count === 1 ? 'product' : 'products'}
                        </span>
                      </span>
                      <ChevronRight
                        size={18}
                        className="shrink-0 text-graphite transition-transform group-hover:translate-x-0.5 group-hover:text-ink"
                        aria-hidden
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
