export type Review = {
  _id: string;
  rating: number;
  title?: string;
  comment?: string;
  /** First name and last initial, e.g. "Asha R.". */
  authorName: string;
  /** A sample review (development data), not from a customer. */
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
};

/** GET /products/:id/reviews */
export type ReviewList = {
  reviews: Review[];
  page: number;
  pages: number;
  count: number;
  /** Number of reviews per star rating. */
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

/** GET /products/:id/reviews/mine */
export type MyReviewState = {
  /** True once the customer has received this product (or already reviewed it). */
  canReview: boolean;
  review: { _id: string; rating: number; title?: string; comment?: string } | null;
};

export type ReviewInput = { rating: number; title?: string; comment?: string };
