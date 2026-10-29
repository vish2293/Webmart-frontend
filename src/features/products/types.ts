export type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  countInStock: number;
  rating: number;
  /** Number of reviews (server field name). */
  reviews: number;
  /** Version stamp; sent back on edit so a stale form can't overwrite newer stock. */
  updatedAt: string;
};

/** GET /products/suggest */
export type ProductSuggestions = {
  suggestions: Pick<Product, '_id' | 'name' | 'category' | 'price' | 'imageUrl'>[];
  /** A corrected phrase, only when the typed one matched nothing. */
  didYouMean?: string;
};

/** Fields an admin can create or edit. */
export type ProductInput = Pick<
  Product,
  'name' | 'description' | 'price' | 'imageUrl' | 'category' | 'countInStock'
>;

export type ProductSort = 'newest' | 'price-asc' | 'price-desc';

export type ProductFilters = {
  keyword?: string;
  category?: string;
  sort?: ProductSort;
};
