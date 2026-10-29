import { useId } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpDown, PackageSearch } from 'lucide-react';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/httpClient';
import { ActiveFilters } from '../components/ActiveFilters';
import { FiltersPanel } from '../components/FiltersPanel';
import { ProductGrid } from '../components/ProductGrid';
import { useProductCategories, useProducts } from '../hooks/useProducts';
import {
  applyClientFilters,
  isProductSort,
  parseListingFilters,
  sortLabels,
  toSearchParams,
  type ListingFilters,
} from '../utils/parseFilters';

function headingFor({ keyword, category }: ListingFilters) {
  if (keyword) return `Results for “${keyword}”`;
  return category || 'All products';
}

export default function ProductListPage() {
  const sortId = useId();
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseListingFilters(searchParams);
  // Only server-side filters go in the query key; price/stock re-filter the cached list.
  const productsQuery = useProducts({
    keyword: filters.keyword,
    category: filters.category,
    sort: filters.sort,
  });
  const categories = useProductCategories();
  const products = productsQuery.data ? applyClientFilters(productsQuery.data, filters) : [];
  const updateFilters = (next: ListingFilters) => setSearchParams(toSearchParams(next));

  const renderResults = () => {
    if (productsQuery.isPending) return <LoadingState label="Loading products…" />;
    if (productsQuery.isError) {
      return (
        <ErrorState
          message={getErrorMessage(productsQuery.error)}
          onRetry={() => productsQuery.refetch()}
        />
      );
    }
    if (products.length === 0) {
      return (
        <EmptyState
          icon={<PackageSearch size={28} aria-hidden />}
          title="No products match these filters"
          description="Remove a filter or try a different search."
          action={
            <Button variant="secondary" onClick={() => setSearchParams(new URLSearchParams())}>
              Clear all filters
            </Button>
          }
        />
      );
    }
    return <ProductGrid products={products} columns="listing" />;
  };

  return (
    <div className="container pt-8 sm:pt-10">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:items-start">
        <div className="lg:sticky lg:top-24">
          <FiltersPanel filters={filters} categories={categories} onChange={updateFilters} />
        </div>

        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-[28px] font-bold leading-tight tracking-display text-ink">
                {headingFor(filters)}
              </h1>
              {!productsQuery.isPending && !productsQuery.isError && (
                <p className="mt-1 text-sm text-graphite" aria-live="polite">
                  {products.length} {products.length === 1 ? 'product' : 'products'} found
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpDown size={16} className="text-graphite" aria-hidden />
              <label htmlFor={sortId} className="sr-only">
                Sort by
              </label>
              <select
                id={sortId}
                value={filters.sort}
                onChange={(event) => {
                  const sort = event.target.value;
                  if (isProductSort(sort)) updateFilters({ ...filters, sort });
                }}
                className="h-9 rounded-lg border border-line bg-white pl-3 pr-8 text-sm text-ink focus:border-ink focus:outline-none focus:ring-2 focus:ring-brand-400/60"
              >
                {Object.entries(sortLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <ActiveFilters filters={filters} onChange={updateFilters} />

          <div aria-busy={productsQuery.isFetching}>{renderResults()}</div>
        </div>
      </div>
    </div>
  );
}
