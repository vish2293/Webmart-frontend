import { useEffect, useRef } from 'react';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCartLine } from '../hooks/useCartLine';
import type { Product } from '../types';

type AddToCartControlProps = {
  product: Product;
  /** `full`: wide yellow CTA (product page). `compact`: black "Add" beside a price (cards). */
  variant?: 'full' | 'compact';
  className?: string;
};

const styles = {
  full: {
    box: 'h-12 w-full text-[15px]',
    add: 'bg-brand-400 text-ink hover:bg-brand-500',
    step: 'w-12',
  },
  compact: {
    box: 'h-9 text-sm',
    add: 'bg-ink px-5 text-white hover:bg-ink-700',
    step: 'w-8',
  },
} as const;

const stepButtonClasses =
  'flex h-full shrink-0 items-center justify-center transition-colors hover:bg-ink-700 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent';

/**
 * "Add" until the product is in the cart, then an inline quantity stepper.
 * At quantity 1 the left control removes the item (trash), above 1 it decrements.
 */
export function AddToCartControl({
  product,
  variant = 'full',
  className = '',
}: AddToCartControlProps) {
  const { quantity, add, setQuantity } = useCartLine(product);
  const isOutOfStock = product.countInStock <= 0;
  const isAtStockLimit = quantity >= product.countInStock;
  const style = styles[variant];

  // Swapping between the button and the stepper unmounts the focused control; move focus to
  // its counterpart so keyboard users stay in place.
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const increaseButtonRef = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<'add' | 'increase' | null>(null);

  useEffect(() => {
    if (pendingFocus.current === 'add') addButtonRef.current?.focus();
    if (pendingFocus.current === 'increase') increaseButtonRef.current?.focus();
    pendingFocus.current = null;
  }, [quantity]);

  if (isOutOfStock) {
    return (
      <button
        type="button"
        disabled
        className={`${style.box} cursor-not-allowed rounded-lg bg-mist px-4 font-semibold text-graphite ${className}`}
      >
        Sold out
      </button>
    );
  }

  if (quantity === 0) {
    return (
      <button
        ref={addButtonRef}
        type="button"
        onClick={() => {
          pendingFocus.current = 'increase';
          add();
        }}
        className={`${style.box} ${style.add} flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors ${className}`}
      >
        {variant === 'full' && <ShoppingBag size={16} aria-hidden />}
        {variant === 'full' ? 'Add to cart' : 'Add'}
        <span className="sr-only">: {product.name}</span>
      </button>
    );
  }

  const isLastOne = quantity === 1;

  return (
    <div
      role="group"
      aria-label={`${product.name} in cart`}
      className={`${style.box} flex items-center justify-between overflow-hidden rounded-lg bg-ink text-white ${className}`}
    >
      <button
        type="button"
        className={`${stepButtonClasses} ${style.step}`}
        onClick={() => {
          if (isLastOne) pendingFocus.current = 'add';
          setQuantity(quantity - 1);
        }}
        aria-label={isLastOne ? `Remove ${product.name} from cart` : 'Decrease quantity'}
      >
        {isLastOne ? <Trash2 size={15} aria-hidden /> : <Minus size={15} aria-hidden />}
      </button>
      <span className="min-w-6 text-center font-semibold tabular-nums" aria-live="polite">
        {quantity}
        <span className="sr-only"> in cart</span>
      </span>
      <button
        ref={increaseButtonRef}
        type="button"
        className={`${stepButtonClasses} ${style.step}`}
        onClick={() => setQuantity(quantity + 1)}
        disabled={isAtStockLimit}
        aria-label={isAtStockLimit ? 'Maximum available quantity in cart' : 'Increase quantity'}
      >
        <Plus size={15} aria-hidden />
      </button>
    </div>
  );
}
