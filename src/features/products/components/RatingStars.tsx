import { Star } from 'lucide-react';

const maxRating = 5;

export function RatingStars({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const rounded = Math.round(rating);

  return (
    <div className="flex items-center gap-2 text-[13px] text-graphite">
      <span
        className="flex gap-0.5"
        role="img"
        aria-label={`Rated ${rating.toFixed(1)} out of ${maxRating}`}
      >
        {Array.from({ length: maxRating }, (_, index) => (
          <Star
            key={index}
            size={14}
            aria-hidden
            className={index < rounded ? 'fill-ink text-ink' : 'text-zinc-300'}
          />
        ))}
      </span>
      <span>
        {rating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
      </span>
    </div>
  );
}
