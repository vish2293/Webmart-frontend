import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth';
import { getErrorMessage } from '@/lib/httpClient';
import { formatDate } from '@/utils/formatDate';
import { useMyReview, useReviews } from '../hooks/useReviews';
import type { ReviewList } from '../types';
import { ReviewForm } from './ReviewForm';

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          aria-hidden
          className={star <= rating ? 'fill-ink text-ink' : 'text-zinc-300'}
        />
      ))}
    </span>
  );
}

function Summary({ list, average }: { list: ReviewList; average: number }) {
  return (
    <div className="flex flex-wrap items-center gap-6 rounded-xl border border-line bg-white p-5">
      <div className="text-center">
        <p className="text-4xl font-bold tabular-nums text-ink">{average.toFixed(1)}</p>
        <Stars rating={Math.round(average)} />
        <p className="mt-1 text-xs text-graphite">
          {list.count} {list.count === 1 ? 'review' : 'reviews'}
        </p>
      </div>
      <ul className="min-w-[200px] flex-1 space-y-1.5" aria-label="Rating breakdown">
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const count = list.distribution[star];
          return (
            <li key={star} className="flex items-center gap-2 text-xs text-graphite">
              <span className="w-8 shrink-0 tabular-nums">{star} ★</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-mist">
                <span
                  className="block h-full rounded-full bg-brand-400"
                  style={{ width: `${list.count ? (count / list.count) * 100 : 0}%` }}
                />
              </span>
              <span className="w-6 shrink-0 text-right tabular-nums">{count}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Reviews on a product page: summary, list, and the form for customers who received it. */
export function ReviewsSection({ productId, average }: { productId: string; average: number }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [page, setPage] = useState(1);
  const reviews = useReviews(productId, page);
  const mine = useMyReview(productId, { enabled: isAuthenticated });
  const list = reviews.data;

  return (
    <section className="mt-16" aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="mb-6 text-xl font-bold tracking-display text-ink">
        Customer reviews
      </h2>

      {reviews.isError && (
        <p role="alert" className="text-sm text-red-700">
          {getErrorMessage(reviews.error, 'Could not load reviews.')}
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        <div>
          {list && list.count > 0 ? (
            <>
              <Summary list={list} average={average} />
              <ul className="mt-6 divide-y divide-line border-y border-line">
                {list.reviews.map((review) => (
                  <li key={review._id} className="py-5">
                    <div className="flex items-center gap-3">
                      <Stars rating={review.rating} />
                      {review.title && (
                        <p className="text-sm font-semibold text-ink">{review.title}</p>
                      )}
                    </div>
                    {review.comment && (
                      <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-graphite">
                        {review.comment}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-graphite">
                      {review.authorName} · {formatDate(review.createdAt)}
                      <span className="ml-2 rounded-full bg-mist px-2 py-0.5 text-[11px] font-medium text-ink">
                        {review.isDemo ? 'Sample review' : 'Verified purchase'}
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
              {list.pages > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm text-graphite">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page <= 1 || reviews.isFetching}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    Newer
                  </Button>
                  <span>
                    Page {list.page} of {list.pages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page >= list.pages || reviews.isFetching}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Older
                  </Button>
                </div>
              )}
            </>
          ) : (
            reviews.isSuccess && (
              <p className="rounded-xl border border-dashed border-line px-6 py-10 text-center text-sm text-graphite">
                No reviews yet. Customers who receive this product can be the first to review it.
              </p>
            )
          )}
        </div>

        <div>
          {!isAuthenticated ? (
            <p className="rounded-xl border border-line bg-mist p-5 text-sm text-graphite">
              <Link
                to="/login"
                state={{ from: location.pathname }}
                className="font-semibold text-ink underline underline-offset-2"
              >
                Log in
              </Link>{' '}
              to review this product if you&apos;ve bought it.
            </p>
          ) : mine.data?.canReview ? (
            // Remount when the saved review changes so the form shows the latest values.
            <ReviewForm
              key={mine.data.review?._id ?? 'new'}
              productId={productId}
              existing={mine.data.review}
            />
          ) : (
            mine.isSuccess && (
              <p className="rounded-xl border border-line bg-mist p-5 text-sm text-graphite">
                You can review this product once it has been delivered to you.
              </p>
            )
          )}
        </div>
      </div>
    </section>
  );
}
