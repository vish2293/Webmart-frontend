import { useId } from 'react';
import { Gift } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';

type PointsRedeemerProps = {
  balance: number;
  /** From the server quote: the most points this order allows. */
  maxRedeemable: number;
  isUsingPoints: boolean;
  onChange: (isUsingPoints: boolean) => void;
  disabled?: boolean;
};

/** All-or-nothing toggle: uses as many points as the order allows (the server decides). */
export function PointsRedeemer({
  balance,
  maxRedeemable,
  isUsingPoints,
  onChange,
  disabled = false,
}: PointsRedeemerProps) {
  const checkboxId = useId();
  if (balance <= 0) return null;

  if (maxRedeemable <= 0) {
    return (
      <p className="flex items-start gap-2 rounded-lg bg-mist p-3 text-xs text-graphite">
        <Gift size={14} className="mt-0.5 shrink-0" aria-hidden />
        You have {balance} points. Points can cover up to 20% of the items, so this order is too
        small to use them.
      </p>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border border-line p-3 text-sm">
      <input
        id={checkboxId}
        type="checkbox"
        checked={isUsingPoints}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 accent-brand-500"
      />
      <label htmlFor={checkboxId} className="cursor-pointer">
        <span className="font-medium text-ink">
          Use {maxRedeemable} points (save {formatCurrency(maxRedeemable)})
        </span>
        <span className="block text-xs text-graphite">
          You have {balance} points · 1 point = ₹1 · up to 20% of the items
        </span>
      </label>
    </div>
  );
}
