import { Check, Crown } from 'lucide-react';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { useAuth } from '@/features/auth';
import { memberBenefits, useMembership, usePlans } from '@/features/membership';
import { formatCurrency, formatCurrencyWhole } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';

const sectionClasses =
  'overflow-hidden rounded-2xl bg-ink bg-[radial-gradient(circle_at_85%_20%,#27272A_0%,transparent_55%)] text-white';

/** Shown instead of the promo to people who already have Plus: their plan, expiry and savings. */
function MemberBanner({
  planLabel,
  endsAt,
  daysLeft,
  savedAmount,
  savedOrders,
}: Readonly<{
  planLabel: string;
  endsAt?: string;
  daysLeft: number;
  savedAmount: number;
  savedOrders: number;
}>) {
  return (
    <section aria-labelledby="plus-member-heading" className={sectionClasses}>
      <div className="grid items-center gap-8 p-7 sm:p-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-brand-400 px-3 py-1 text-xs font-bold text-ink">
            <Crown size={13} aria-hidden /> Plus member
          </p>
          <h2
            id="plus-member-heading"
            className="mt-4 text-3xl font-extrabold leading-tight tracking-display sm:text-4xl"
          >
            This is your Plus account<span className="text-brand-400">.</span>
          </h2>
          <p className="mt-3 max-w-md text-sm text-zinc-300">
            {planLabel} · valid until {formatDate(endsAt)} ({daysLeft}{' '}
            {daysLeft === 1 ? 'day' : 'days'} left). You&apos;ve saved{' '}
            <strong className="font-semibold text-white">{formatCurrency(savedAmount)}</strong> on
            delivery across {savedOrders} {savedOrders === 1 ? 'order' : 'orders'}.
          </p>
          <div className="mt-6">
            <ButtonLink to="/plus" size="lg">
              Manage Plus
            </ButtonLink>
          </div>
        </div>
        <ul className="space-y-3 text-sm">
          {memberBenefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-400 text-ink">
                <Check size={13} aria-hidden />
              </span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Membership promo. Takes its "from" price from the plans API so it can't drift from checkout. */
export function PlusBanner() {
  const { isAuthenticated } = useAuth();
  const plans = usePlans();
  const membership = useMembership({ enabled: isAuthenticated });
  const monthly = plans.data?.find((plan) => plan.id === 'monthly');

  // Don't flash the promo at someone who turns out to be a member.
  if (isAuthenticated && membership.isPending) return null;

  const summary = membership.data;
  if (summary?.isMember) {
    return (
      <MemberBanner
        planLabel={summary.current?.label ?? 'Plus'}
        endsAt={summary.endsAt}
        daysLeft={summary.daysLeft}
        savedAmount={summary.savings.amount}
        savedOrders={summary.savings.orders}
      />
    );
  }

  return (
    <section aria-labelledby="plus-banner-heading" className={sectionClasses}>
      <div className="grid items-center gap-8 p-7 sm:p-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-brand-400 px-3 py-1 text-xs font-bold text-ink">
            <Crown size={13} aria-hidden /> WebMart Plus
          </p>
          <h2
            id="plus-banner-heading"
            className="mt-4 text-3xl font-extrabold leading-tight tracking-display sm:text-4xl"
          >
            Faster delivery, on the house<span className="text-brand-400">.</span>
          </h2>
          <p className="mt-3 max-w-md text-sm text-zinc-300">
            Plus members never pay for shipping or express delivery, and earn double reward points.
            {monthly && ` From ${formatCurrencyWhole(monthly.price)} a month.`}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <ButtonLink to="/plus" size="lg">
              Explore Plus
            </ButtonLink>
            <p className="text-xs text-zinc-400">Cancel within 7 days for a full refund.</p>
          </div>
        </div>
        <ul className="space-y-3 text-sm">
          {memberBenefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-400 text-ink">
                <Check size={13} aria-hidden />
              </span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
