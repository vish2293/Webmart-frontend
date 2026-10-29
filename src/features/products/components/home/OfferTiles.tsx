import { Link } from 'react-router-dom';
import { Crown, Gift, Percent, Truck, type LucideIcon } from 'lucide-react';
import { pricingRules } from '@/features/cart';
import { formatCurrencyWhole } from '@/utils/formatCurrency';

type Offer = { title: string; detail: string; Icon: LucideIcon; to: string };

// The numbers restate server rules: first-order 10% up to ₹200 and 1 point per ₹100 live in
// server/src/modules/rewards/rewards.config.ts; Plus in server/src/modules/memberships.
const offers: Offer[] = [
  {
    title: `Free shipping over ${formatCurrencyWhole(pricingRules.freeShippingThreshold)}`,
    detail: 'On every order, no code needed',
    Icon: Truck,
    to: '/products',
  },
  {
    title: '10% off your first order',
    detail: `Up to ${formatCurrencyWhole(200)}, applied at checkout`,
    Icon: Percent,
    to: '/register',
  },
  {
    title: 'Earn reward points',
    detail: `1 point per ${formatCurrencyWhole(100)}, spend them at checkout`,
    Icon: Gift,
    to: '/policies/refunds',
  },
  {
    title: 'Join Plus',
    detail: 'Free express delivery and 2× points',
    Icon: Crown,
    to: '/plus',
  },
];

/** Compact "offers for you" row under the hero, so deals are visible before any scrolling. */
export function OfferTiles() {
  return (
    <section aria-label="Offers" className="border-b border-line bg-white">
      <ul className="container grid grid-cols-1 gap-3 py-5 sm:grid-cols-2 lg:grid-cols-4">
        {offers.map(({ title, detail, Icon, to }) => (
          <li key={title}>
            <Link
              to={to}
              className="group flex h-full items-center gap-3 rounded-xl border border-line p-3.5 transition-colors hover:border-ink"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-400 text-ink">
                <Icon size={20} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold leading-snug text-ink">{title}</span>
                <span className="block text-xs text-graphite">{detail}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
