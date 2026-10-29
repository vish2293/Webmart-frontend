import { Minus, Plus } from 'lucide-react';

type QuantityStepperProps = {
  productName: string;
  quantity: number;
  max: number;
  onChange: (quantity: number) => void;
};

const stepButtonClasses =
  'flex h-8 w-8 items-center justify-center text-ink hover:bg-mist disabled:cursor-not-allowed disabled:opacity-30';

export function QuantityStepper({ productName, quantity, max, onChange }: QuantityStepperProps) {
  return (
    <div
      className="inline-flex items-center overflow-hidden rounded-lg border border-line"
      role="group"
      aria-label={`Quantity of ${productName}`}
    >
      <button
        type="button"
        className={stepButtonClasses}
        onClick={() => onChange(quantity - 1)}
        disabled={quantity <= 1}
        aria-label="Decrease quantity"
      >
        <Minus size={14} aria-hidden />
      </button>
      <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        className={stepButtonClasses}
        onClick={() => onChange(quantity + 1)}
        disabled={quantity >= max}
        aria-label="Increase quantity"
      >
        <Plus size={14} aria-hidden />
      </button>
    </div>
  );
}
