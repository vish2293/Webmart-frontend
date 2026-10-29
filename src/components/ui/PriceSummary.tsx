import type { ReactNode } from 'react';
import { formatCurrency } from '@/utils/formatCurrency';

type PriceSummaryProps = {
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  children?: ReactNode;
};

/** Order totals breakdown shared by cart, checkout and order detail. */
export function PriceSummary({
  itemsPrice,
  shippingPrice,
  taxPrice,
  totalPrice,
  children,
}: PriceSummaryProps) {
  return (
    <section className="h-fit rounded-xl border border-line bg-white p-5 lg:sticky lg:top-24">
      <h2 className="mb-4 text-base font-semibold text-ink">Order summary</h2>
      <dl className="space-y-2.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-graphite">Items</dt>
          <dd className="font-medium tabular-nums">{formatCurrency(itemsPrice)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-graphite">Shipping</dt>
          <dd className="font-medium tabular-nums">
            {shippingPrice === 0 ? 'Free' : formatCurrency(shippingPrice)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-graphite">Tax</dt>
          <dd className="font-medium tabular-nums">{formatCurrency(taxPrice)}</dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-line pt-3">
          <dt className="font-semibold">Total</dt>
          <dd className="text-lg font-bold tabular-nums">{formatCurrency(totalPrice)}</dd>
        </div>
      </dl>
      {children && <div className="mt-5 space-y-2.5">{children}</div>}
    </section>
  );
}
