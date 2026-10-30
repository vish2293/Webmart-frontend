import { useId, useState, type FormEvent } from 'react';
import { Check, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fieldClasses } from '@/components/ui/fieldStyles';
import { formatCurrency } from '@/utils/formatCurrency';

type CouponFieldProps = {
  /** The code the server accepted for this order, with what it takes off. */
  applied?: { code: string; discount: number };
  /** Why the entered code doesn't apply (from the server's quote). */
  error?: string;
  /** True while the quote for a just-entered code is loading. */
  isChecking: boolean;
  onApply: (code: string) => void;
  onRemove: () => void;
  disabled?: boolean;
};

/** "Have a coupon?": enter a code, see the discount or the reason it didn't work. */
export function CouponField({
  applied,
  error,
  isChecking,
  onApply,
  onRemove,
  disabled = false,
}: Readonly<CouponFieldProps>) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const [draft, setDraft] = useState('');

  if (applied) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-green-300 bg-green-50 p-3 text-sm">
        <Check size={16} className="shrink-0 text-green-700" aria-hidden />
        <p className="min-w-0 flex-1 text-ink">
          <span className="font-mono font-semibold">{applied.code}</span> applied. You save{' '}
          {formatCurrency(applied.discount)}.
        </p>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="shrink-0 rounded p-1 text-graphite hover:text-ink disabled:opacity-40"
          aria-label={`Remove coupon ${applied.code}`}
        >
          <X size={16} aria-hidden />
        </button>
      </div>
    );
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const code = draft.trim();
    if (code) onApply(code);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor={inputId} className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium">
        <Tag size={14} aria-hidden /> Have a coupon?
      </label>
      <div className="flex gap-2">
        <input
          id={inputId}
          value={draft}
          onChange={(event) => setDraft(event.target.value.toUpperCase())}
          placeholder="Enter code"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={32}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`h-10 min-w-0 flex-1 font-mono ${fieldClasses(Boolean(error))}`}
        />
        <Button
          type="submit"
          variant="dark"
          isLoading={isChecking}
          disabled={disabled || !draft.trim()}
        >
          Apply
        </Button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-[13px] text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}
