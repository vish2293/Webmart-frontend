import type { Product, ProductSort } from '../types';

const sortOptions: readonly ProductSort[] = ['newest', 'price-asc', 'price-desc'];

export const isProductSort = (value: string | null): value is ProductSort =>
  value !== null && (sortOptions as readonly string[]).includes(value);

export const sortLabels: Record<ProductSort, string> = {
  newest: 'Newest',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
};

export const priceRanges = [
  { id: 'under-1000', label: 'Under ₹1,000', min: 0, max: 1_000 },
  { id: '1000-5000', label: '₹1,000 – ₹5,000', min: 1_000, max: 5_000 },
  { id: '5000-20000', label: '₹5,000 – ₹20,000', min: 5_000, max: 20_000 },
  { id: 'over-20000', label: 'Over ₹20,000', min: 20_000, max: Infinity },
] as const;

export type PriceRangeId = (typeof priceRanges)[number]['id'];

const isPriceRangeId = (value: string | null): value is PriceRangeId =>
  priceRanges.some((range) => range.id === value);

/** Everything the listing page can be filtered by. Lives in the URL. */
export type ListingFilters = {
  keyword: string;
  category: string;
  sort: ProductSort;
  price: PriceRangeId | '';
  inStockOnly: boolean;
};

export const emptyListingFilters: ListingFilters = {
  keyword: '',
  category: '',
  sort: 'newest',
  price: '',
  inStockOnly: false,
};

/** URL params are untrusted input — validate before use. */
export function parseListingFilters(params: URLSearchParams): ListingFilters {
  const sort = params.get('sort');
  const price = params.get('price');
  return {
    keyword: params.get('q')?.trim().slice(0, 100) ?? '',
    category: params.get('category') ?? '',
    sort: isProductSort(sort) ? sort : 'newest',
    price: isPriceRangeId(price) ? price : '',
    inStockOnly: params.get('stock') === 'in',
  };
}

export function toSearchParams(filters: ListingFilters) {
  const params = new URLSearchParams();
  if (filters.keyword) params.set('q', filters.keyword);
  if (filters.category) params.set('category', filters.category);
  if (filters.sort !== 'newest') params.set('sort', filters.sort);
  if (filters.price) params.set('price', filters.price);
  if (filters.inStockOnly) params.set('stock', 'in');
  return params;
}

// ponytail: price and stock filter client-side because the API returns the full catalogue.
// Move them to the server query once the product list is paginated.
export function applyClientFilters(products: Product[], { price, inStockOnly }: ListingFilters) {
  const range = priceRanges.find((candidate) => candidate.id === price);
  return products.filter(
    (product) =>
      (!range || (product.price >= range.min && product.price < range.max)) &&
      (!inStockOnly || product.countInStock > 0),
  );
}
