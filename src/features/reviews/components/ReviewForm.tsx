import { useState, type FormEvent } from 'react';
import { Star } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { Button } from '@/components/ui/Button';
import { TextAreaField } from '@/components/ui/TextAreaField';
import { TextField } from '@/components/ui/TextField';
import { getErrorMessage } from '@/lib/httpClient';
import { useDeleteReview, useSaveReview } from '../hooks/useReviews';
import type { MyReviewState } from '../types';

const ratingLabels = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'] as const;

function StarInput({ value, onChange }: { value: number; onChange: (rating: number) => void }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-[13px] font-medium text-ink">Your rating</legend>
      <div className="flex items-center gap-1">
        {ratingLabels.map((label, index) => {
          const rating = index + 1;
          return (
            <label key={label} className="cursor-pointer" title={label}>
              <input
                type="radio"
                name="rating"
                value={rating}
                checked={value === rating}
                onChange={() => onChange(rating)}
                className="peer sr-only"
              />
              <Star
                size={28}
                aria-hidden
                className={`transition-colors peer-focus-visible:rounded peer-focus-visible:ring-2 peer-focus-visible:ring-brand-400 ${
                  rating <= value ? 'fill-brand-400 text-brand-500' : 'text-zinc-300'
                }`}
              />
              <span className="sr-only">
                {rating} {rating === 1 ? 'star' : 'stars'}, {label}
              </span>
            </label>
          );
        })}
        {value > 0 && <span className="ml-2 text-sm text-graphite">{ratingLabels[value - 1]}</span>}
      </div>
    </fieldset>
  );
}

/** Write, edit or remove the signed-in customer's own review. */
export function ReviewForm({
  productId,
  existing,
}: {
  productId: string;
  existing: MyReviewState['review'];
}) {
  const save = useSaveReview();
  const remove = useDeleteReview();
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [title, setTitle] = useState(existing?.title ?? '');
  const [comment, setComment] = useState(existing?.comment ?? '');
  const [ratingError, setRatingError] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (rating < 1) {
      setRatingError('Choose a star rating.');
      return;
    }
    setRatingError('');
    setIsSaved(false);
    save.mutate(
      {
        productId,
        input: { rating, title: title.trim() || undefined, comment: comment.trim() || undefined },
      },
      { onSuccess: () => setIsSaved(true) },
    );
  };

  const error = save.error ?? remove.error;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-line bg-white p-5"
      noValidate
    >
      <h3 className="text-base font-semibold text-ink">
        {existing ? 'Your review' : 'Write a review'}
      </h3>
      {error && <Alert variant="error">{getErrorMessage(error)}</Alert>}
      {isSaved && !error && <Alert variant="success">Thanks, your review is saved.</Alert>}
      <div>
        <StarInput value={rating} onChange={setRating} />
        {ratingError && <p className="mt-1.5 text-[13px] text-red-700">{ratingError}</p>}
      </div>
      <TextField
        label="Headline (optional)"
        value={title}
        maxLength={100}
        onChange={(event) => setTitle(event.target.value)}
      />
      <TextAreaField
        label="Your review (optional)"
        rows={4}
        maxLength={2000}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="What did you like or dislike? How did you use it?"
      />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" isLoading={save.isPending}>
          {existing ? 'Update review' : 'Submit review'}
        </Button>
        {existing && (
          <Button
            variant="secondary"
            isLoading={remove.isPending}
            onClick={() => remove.mutate({ productId, reviewId: existing._id })}
          >
            Delete review
          </Button>
        )}
      </div>
    </form>
  );
}
