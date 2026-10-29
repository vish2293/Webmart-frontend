import { Check, Crown } from 'lucide-react';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { memberBenefits, usePlans } from '@/features/membership';
import { formatCurrencyWhole } from '@/utils/formatCurrency';

/** Membership promo. Takes its "from" price from the plans API so it can't drift from checkout. */
export function PlusBanner() {
  const plans = usePlans();
  const monthly = plans.data?.find((plan) => plan.id === 'monthly');

  return (
    <section
      aria-labelledby="plus-banner-heading"
      className="overflow-hidden rounded-2xl bg-ink bg-[radial-gradient(circle_at_85%_20%,#27272A_0%,transparent_55%)] text-white"
    >
      <div className="grid items-center gap-8 p-7 sm:p-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-brand-400 px-3 py-1 text-xs font-bold text-ink">
            <Crown size={13} aria-hidden /> Webvoltz Plus
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
