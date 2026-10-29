import { useEffect, useRef } from 'react';
import { PackageX } from 'lucide-react';
import { ButtonLink } from '@/components/ui/ButtonLink';
import type { StockShortage } from '../utils/stockConflict';

type StockConflictNoticeProps = {
  shortages: StockShortage[];
  /** True when the cart is empty after the update, so there's nothing left to order. */
  isCartEmpty: boolean;
};

function describeShortage({ name, requested, available }: StockShortage) {
  if (available <= 0) {
    return (
      <>
        <strong className="font-semibold">{name}</strong> sold out moments ago. We&apos;ve removed
        it from your cart.
      </>
    );
  }
  return (
    <>
      Only <strong className="font-semibold">{available}</strong> of{' '}
      <strong className="font-semibold">{name}</strong> are left (you asked for {requested}), so
      we&apos;ve updated your quantity to {available}.
    </>
  );
}

/**
 * Shown to the customer who lost a race for limited stock: another order was confirmed first.
 * Takes focus when it appears so keyboard and screen-reader users don't miss it.
 */
export function StockConflictNotice({ shortages, isCartEmpty }: StockConflictNoticeProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      role="alert"
      className="mb-6 rounded-xl border border-brand-300 bg-brand-50 p-5 focus:outline-none"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-400 text-ink">
          <PackageX size={18} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-ink">Someone else just got there first</h2>
          <p className="mt-1 text-sm text-graphite">
            Another customer completed their order for{' '}
            {shortages.length === 1 ? 'this item' : 'these items'} a moment before you. You
            haven&apos;t been charged.
          </p>
          {shortages.length > 0 && (
            <ul className="mt-3 space-y-1.5 text-sm text-ink">
              {shortages.map((shortage) => (
                <li key={shortage.productId} className="flex gap-2">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink" />
                  <span>{describeShortage(shortage)}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-sm font-medium text-ink">
            {isCartEmpty
              ? 'There is nothing left in your cart to order.'
              : 'Check the updated total below, then place your order again.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {isCartEmpty ? (
              <ButtonLink to="/products">Continue shopping</ButtonLink>
            ) : (
              <ButtonLink to="/cart" variant="secondary">
                Review cart
              </ButtonLink>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
