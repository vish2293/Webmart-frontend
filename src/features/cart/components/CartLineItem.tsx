import { Link } from 'react-router-dom';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { formatCurrency } from '@/utils/formatCurrency';
import type { CartItem } from '../types';
import { QuantityStepper } from './QuantityStepper';

type CartLineItemProps = {
  item: CartItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
};

export function CartLineItem({ item, onQuantityChange, onRemove }: CartLineItemProps) {
  return (
    <li className="flex gap-4 py-5">
      <Link
        to={`/products/${item.productId}`}
        tabIndex={-1}
        aria-hidden
        className="shrink-0 overflow-hidden rounded-lg bg-mist"
      >
        <ImageWithFallback
          src={item.imageUrl}
          alt=""
          className="h-20 w-20 object-cover sm:h-24 sm:w-24"
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-ink">
            <Link
              to={`/products/${item.productId}`}
              className="decoration-brand-400 decoration-2 underline-offset-4 hover:underline"
            >
              {item.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-[13px] tabular-nums text-graphite">
            {formatCurrency(item.price)} each
          </p>
          <div className="mt-3 flex items-center gap-4">
            <QuantityStepper
              productName={item.name}
              quantity={item.quantity}
              max={item.countInStock}
              onChange={onQuantityChange}
            />
            <button
              type="button"
              onClick={onRemove}
              className="text-[13px] font-medium text-graphite underline-offset-4 hover:text-red-700 hover:underline"
              aria-label={`Remove ${item.name} from cart`}
            >
              Remove
            </button>
          </div>
        </div>
        <p className="text-[15px] font-semibold tabular-nums text-ink">
          {formatCurrency(item.price * item.quantity)}
        </p>
      </div>
    </li>
  );
}
