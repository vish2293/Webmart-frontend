import type { ReactNode } from 'react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { formatCurrency } from '@/utils/formatCurrency';

export type OrderLine = {
  key: string;
  name: string;
  imageUrl: string;
  quantity: number;
  price: number;
  /** Optional link/heading node for the product name. */
  title?: ReactNode;
};

/** Read-only line items for checkout review and order detail. */
export function OrderItemsList({ lines }: { lines: OrderLine[] }) {
  return (
    <ul className="divide-y divide-line">
      {lines.map((line) => (
        <li key={line.key} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <ImageWithFallback
            src={line.imageUrl}
            alt=""
            className="h-14 w-14 shrink-0 rounded-lg bg-mist object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{line.title ?? line.name}</p>
            <p className="text-sm text-graphite">
              {line.quantity} × {formatCurrency(line.price)}
            </p>
          </div>
          <p className="text-sm font-semibold tabular-nums text-ink">
            {formatCurrency(line.quantity * line.price)}
          </p>
        </li>
      ))}
    </ul>
  );
}
