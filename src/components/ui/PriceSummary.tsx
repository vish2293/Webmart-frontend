import type { ReactNode } from 'react';
import { formatCurrency } from '@/utils/formatCurrency';

type PriceSummaryProps = {
  itemsPrice: number;
  shippingPrice: number;
  expressDeliveryPrice?: number;
  /** Shipping and express fees Plus waived; shown as a note when greater than zero. */
  memberSavings?: number;
  taxPrice: number;
  totalPrice: number;
  /** Discount lines render only when greater than zero. */
  firstOrderDiscount?: number;
  couponDiscount?: number;
  couponCode?: string;
  pointsDiscount?: number;
  pointsRedeemed?: number;
  children?: ReactNode;
};

function DiscountLine({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex justify-between text-green-700">
      <dt>{label}</dt>
      <dd className="font-medium tabular-nums">−{formatCurrency(amount)}</dd>
    </div>
  );
}

/** Order totals breakdown shared by cart, checkout and order detail. */
export function PriceSummary({
  itemsPrice,
  shippingPrice,
  expressDeliveryPrice = 0,
  memberSavings = 0,
  taxPrice,
  totalPrice,
  firstOrderDiscount = 0,
  couponDiscount = 0,
  couponCode,
  pointsDiscount = 0,
  pointsRedeemed = 0,
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
        {firstOrderDiscount > 0 && (
          <DiscountLine label="First-order discount" amount={firstOrderDiscount} />
        )}
        {couponDiscount > 0 && (
          <DiscountLine
            label={`Coupon${couponCode ? ` (${couponCode})` : ''}`}
            amount={couponDiscount}
          />
        )}
        {pointsDiscount > 0 && (
          <DiscountLine label={`Points used (${pointsRedeemed})`} amount={pointsDiscount} />
        )}
        <div className="flex justify-between">
          <dt className="text-graphite">Shipping</dt>
          <dd className="font-medium tabular-nums">
            {shippingPrice === 0 ? 'Free' : formatCurrency(shippingPrice)}
          </dd>
        </div>
        {expressDeliveryPrice > 0 && (
          <div className="flex justify-between">
            <dt className="text-graphite">Express delivery</dt>
            <dd className="font-medium tabular-nums">{formatCurrency(expressDeliveryPrice)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-graphite">Tax</dt>
          <dd className="font-medium tabular-nums">{formatCurrency(taxPrice)}</dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-line pt-3">
          <dt className="font-semibold">Total</dt>
          <dd className="text-lg font-bold tabular-nums">{formatCurrency(totalPrice)}</dd>
        </div>
      </dl>
      {memberSavings > 0 && (
        <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-[13px] text-ink">
          Plus saved you {formatCurrency(memberSavings)} on delivery.
        </p>
      )}
      {children && <div className="mt-5 space-y-2.5">{children}</div>}
    </section>
  );
}
