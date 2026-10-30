import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Crown, Gift, Sparkles, Truck, Zap, type LucideIcon } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';
import { buttonClasses } from '@/components/ui/buttonStyles';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/features/auth';
import { getErrorMessage } from '@/lib/httpClient';
import { formatCurrency, formatCurrencyWhole } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { membershipRules } from '../config';
import {
  useBuyMembership,
  useCancelMembership,
  useMembership,
  usePlans,
} from '../hooks/useMembership';
import type { MembershipPlan, MembershipSummary } from '../types';

const dayMs = 24 * 60 * 60_000;

/** The one memorable thing on the page: Plus as a physical pass, real data once you're a member. */
function PlusPass({
  name,
  membership,
}: Readonly<{ name?: string; membership?: MembershipSummary }>) {
  const current = membership?.isMember ? membership.current : null;
  const totalDays =
    current?.startsAt && current.endsAt
      ? Math.max(
          1,
          Math.round(
            (new Date(current.endsAt).getTime() - new Date(current.startsAt).getTime()) / dayMs,
          ),
        )
      : null;
  const remaining = membership && totalDays ? Math.min(1, membership.daysLeft / totalDays) : null;

  return (
    <div className="relative mx-auto w-full max-w-sm lg:mx-0 lg:ml-auto">
      {/* A second sheet behind the pass gives it thickness without a drop shadow. */}
      <div
        aria-hidden
        className="absolute inset-0 translate-x-3 translate-y-3 rounded-3xl bg-white/10"
      />
      <div className="relative -rotate-2 rounded-3xl bg-brand-400 p-6 text-ink transition-transform duration-500 hover:rotate-0 motion-reduce:transition-none sm:p-7">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-extrabold tracking-display">
            <Crown size={18} aria-hidden /> WebMart Plus
          </p>
          <span className="rounded-full bg-ink px-2.5 py-0.5 text-[11px] font-bold text-brand-400">
            {current ? 'Active' : 'Member pass'}
          </span>
        </div>

        <p className="mt-14 truncate text-2xl font-extrabold tracking-display">
          {name ?? 'Your name'}
        </p>
        <p className="mt-1 text-sm font-medium">
          {current
            ? `${current.label} · valid until ${formatDate(membership?.endsAt)}`
            : 'Free delivery, 2× points, every order'}
        </p>

        {current && membership && (
          <div className="mt-6">
            {remaining !== null && (
              <div
                role="progressbar"
                aria-label="Membership time left"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(remaining * 100)}
                className="h-1.5 overflow-hidden rounded-full bg-ink/15"
              >
                <div
                  className="h-full rounded-full bg-ink"
                  style={{ width: `${remaining * 100}%` }}
                />
              </div>
            )}
            <p className="mt-2 flex justify-between text-xs font-semibold">
              <span>
                {membership.daysLeft} {membership.daysLeft === 1 ? 'day' : 'days'} left
              </span>
              <span>Saved {formatCurrency(membership.savings.amount)} on delivery</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/** Cancel / refund controls for an active member. */
function ManageMembership({ membership }: Readonly<{ membership: MembershipSummary }>) {
  const cancel = useCancelMembership();
  const [isConfirming, setIsConfirming] = useState(false);
  const { current } = membership;

  return (
    <section
      aria-label="Manage your membership"
      className="mt-6 flex flex-col gap-3 rounded-2xl border border-line bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
    >
      <div className="text-sm text-graphite">
        <p className="font-semibold text-ink">
          You&apos;re a Plus member. Saved {formatCurrency(membership.savings.amount)} on delivery
          across {membership.savings.orders} {membership.savings.orders === 1 ? 'order' : 'orders'}.
        </p>
        {current?.canRefund ? (
          <p className="mt-1">
            Cancel for a full refund until {formatDate(current.refundDeadline)}, as long as no order
            has used your Plus benefits yet.
          </p>
        ) : (
          <p className="mt-1">
            Memberships can be cancelled for a full refund within {membershipRules.refundWindowDays}{' '}
            days, before any order uses the benefits. See the{' '}
            <Link to="/policies/membership" className="underline underline-offset-2">
              Plus terms
            </Link>
            .
          </p>
        )}
        {cancel.isError && (
          <Alert variant="error" className="mt-3">
            {getErrorMessage(cancel.error, 'Could not cancel your membership.')}
          </Alert>
        )}
      </div>
      {current?.canRefund && (
        <Button variant="secondary" className="shrink-0" onClick={() => setIsConfirming(true)}>
          Cancel and get a refund
        </Button>
      )}

      <ConfirmDialog
        isOpen={isConfirming}
        title="Cancel Plus?"
        description={`You'll be refunded in full, your Plus benefits end now and the ${membershipRules.welcomeBonusPoints} welcome points are removed.`}
        confirmLabel="Cancel and refund"
        confirmVariant="danger"
        isConfirming={cancel.isPending}
        onCancel={() => setIsConfirming(false)}
        onConfirm={() =>
          current && cancel.mutate(current.id, { onSettled: () => setIsConfirming(false) })
        }
      />
    </section>
  );
}

type BenefitTileProps = {
  Icon: LucideIcon;
  title: string;
  children: ReactNode;
  /** Grid span and colour, so the four tiles make an uneven, deliberate pattern. */
  className: string;
  iconClassName: string;
};

function BenefitTile({
  Icon,
  title,
  children,
  className,
  iconClassName,
}: Readonly<BenefitTileProps>) {
  return (
    <li className={`flex flex-col justify-between gap-10 rounded-2xl p-6 sm:p-7 ${className}`}>
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClassName}`}>
        <Icon size={20} aria-hidden />
      </span>
      <div>
        <h3 className="text-xl font-extrabold tracking-display sm:text-2xl">{title}</h3>
        <p className="mt-1.5 max-w-[42ch] text-sm opacity-80">{children}</p>
      </div>
    </li>
  );
}

function PlanCard({
  plan,
  savePercent,
  action,
}: Readonly<{
  plan: MembershipPlan;
  /** Set on the best-value plan: how much cheaper per month it is than the other plan. */
  savePercent: number | null;
  action: ReactNode;
}>) {
  const perMonth = Math.round(plan.price / (plan.durationDays / 30));
  const isFeatured = savePercent !== null;
  return (
    <article
      className={`flex flex-col rounded-2xl p-6 sm:p-8 ${
        isFeatured ? 'bg-ink text-white' : 'border border-line bg-white text-ink'
      }`}
    >
      <div className="flex h-7 items-center justify-between">
        <h3 className="text-lg font-bold">{plan.label}</h3>
        {isFeatured && (
          <span className="rounded-full bg-brand-400 px-2.5 py-0.5 text-xs font-bold text-ink">
            Save {savePercent}%
          </span>
        )}
      </div>
      <p className="mt-6 text-5xl font-extrabold tracking-display tabular-nums">
        {formatCurrencyWhole(plan.price)}
      </p>
      <p className={`mt-2 text-sm ${isFeatured ? 'text-zinc-300' : 'text-graphite'}`}>
        for {plan.durationDays} days · about {formatCurrencyWhole(perMonth)} a month
      </p>
      {/* mt-auto pins the button to the bottom edge of every card. */}
      <div className="mt-auto pt-8">{action}</div>
    </article>
  );
}

export default function PlusPage() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const plans = usePlans();
  const membership = useMembership({ enabled: isAuthenticated });
  const buy = useBuyMembership(user ? { name: user.name, email: user.email } : null);

  if (plans.isPending || (isAuthenticated && membership.isPending)) {
    return <LoadingState label="Loading Plus…" />;
  }
  if (plans.isError) {
    return <ErrorState message={getErrorMessage(plans.error)} onRetry={() => plans.refetch()} />;
  }

  const summary = membership.data;
  const isMember = summary?.isMember === true;
  const canBuy = !isAuthenticated || summary?.canBuy !== false;
  const justJoined = buy.data?.isMember === true;
  // The customer closed the Razorpay window without paying: the mutation resolves with null.
  const isPaymentCancelled = buy.isSuccess && buy.data === null;
  const renewalOpensOn =
    summary?.endsAt && !canBuy
      ? new Date(Date.parse(summary.endsAt) - membershipRules.renewalWindowDays * 24 * 60 * 60_000)
      : null;

  // Cheapest per day is the featured plan; its saving is measured against the priciest per day.
  const perDay = (plan: MembershipPlan) => plan.price / plan.durationDays;
  const sorted = [...plans.data].sort((a, b) => perDay(a) - perDay(b));
  const featured = sorted[0];
  const priciest = sorted.at(-1);
  const savePercent =
    featured && priciest && perDay(priciest) > perDay(featured)
      ? Math.round((1 - perDay(featured) / perDay(priciest)) * 100)
      : null;
  const monthly = plans.data.find((plan) => plan.id === 'monthly');

  return (
    <div className="container pb-16 pt-6 sm:pt-8">
      {justJoined && (
        <Alert variant="success" className="mb-6">
          Welcome to Plus! Your benefits are active and your {membershipRules.welcomeBonusPoints}{' '}
          welcome points are in your account.
        </Alert>
      )}

      <section
        aria-labelledby="plus-heading"
        className="overflow-hidden rounded-3xl bg-ink bg-[radial-gradient(circle_at_80%_30%,#27272A_0%,transparent_60%)] text-white"
      >
        <div className="grid items-center gap-12 p-7 sm:p-12 lg:grid-cols-[1.25fr_1fr] lg:gap-8 lg:p-16">
          <div>
            <h1
              id="plus-heading"
              className="text-[42px] font-extrabold leading-[0.95] tracking-display sm:text-6xl xl:text-7xl"
            >
              Delivery that costs nothing<span className="text-brand-400">.</span>
            </h1>
            <p className="mt-5 max-w-md text-base text-zinc-300">
              WebMart Plus covers shipping on every order, gets express parcels to you in 1–2 days
              and doubles the reward points you earn.
            </p>
            {!isMember && (
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <a href="#plans" className={buttonClasses('primary', 'lg')}>
                  See plans
                </a>
                {monthly && (
                  <p className="text-sm text-zinc-400">
                    From {formatCurrencyWhole(monthly.price)} a month
                  </p>
                )}
              </div>
            )}
          </div>
          <PlusPass name={user?.name} membership={summary} />
        </div>
      </section>

      {summary?.isMember && <ManageMembership membership={summary} />}

      <section aria-labelledby="benefits-heading" className="mt-16">
        <h2
          id="benefits-heading"
          className="max-w-xl text-3xl font-extrabold tracking-display text-ink sm:text-4xl"
        >
          What Plus gets you
        </h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-6">
          <BenefitTile
            Icon={Truck}
            title="Free shipping"
            className="bg-brand-400 text-ink md:col-span-4"
            iconClassName="bg-ink text-brand-400"
          >
            On every order, whatever the size. No minimum to reach.
          </BenefitTile>
          <BenefitTile
            Icon={Zap}
            title="Free express delivery"
            className="bg-ink text-white md:col-span-2"
            iconClassName="bg-brand-400 text-ink"
          >
            Get it in 1–2 days without the usual extra charge.
          </BenefitTile>
          <BenefitTile
            Icon={Sparkles}
            title={`${membershipRules.pointsMultiplier}× reward points`}
            className="border border-line bg-white text-ink md:col-span-2"
            iconClassName="bg-brand-400 text-ink"
          >
            Earn double on every order and spend the points at checkout.
          </BenefitTile>
          <BenefitTile
            Icon={Gift}
            title={`${membershipRules.welcomeBonusPoints} welcome points`}
            className="border border-line bg-mist text-ink md:col-span-4"
            iconClassName="bg-ink text-brand-400"
          >
            Added to your account the moment you join. Spend them at checkout, 1 point = ₹1.
          </BenefitTile>
        </ul>
      </section>

      <section id="plans" aria-labelledby="plans-heading" className="mt-16 scroll-mt-24">
        <h2
          id="plans-heading"
          className="max-w-xl text-3xl font-extrabold tracking-display text-ink sm:text-4xl"
        >
          {isMember ? 'Renew your membership' : 'Pick how long you want it'}
        </h2>
        {!canBuy && (
          <p className="mt-2 text-sm text-graphite">
            You can renew in the last {membershipRules.renewalWindowDays} days of your membership
            {renewalOpensOn && `, from ${formatDate(renewalOpensOn.toISOString())}`}.
          </p>
        )}

        {/* Shown here, beside the buttons, so it isn't missed above the fold. */}
        {isPaymentCancelled && (
          <Alert variant="error" className="mt-6">
            Payment cancelled, so nothing was charged. Pick a plan whenever you&apos;re ready.
          </Alert>
        )}
        {buy.isError && (
          <Alert variant="error" className="mt-6">
            {getErrorMessage(buy.error, 'Could not complete your payment.')}
          </Alert>
        )}

        <div className="mt-8 grid items-stretch gap-4 md:grid-cols-2">
          {plans.data.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              savePercent={plan.id === featured?.id ? savePercent : null}
              action={
                isAuthenticated ? (
                  <Button
                    size="lg"
                    // Brand button on the dark card, black on the light one; the disabled look is
                    // flat grey instead of a faded copy of the brand colour.
                    variant={plan.id === featured?.id && savePercent !== null ? 'primary' : 'dark'}
                    className={`w-full ${
                      plan.id === featured?.id && savePercent !== null
                        ? 'disabled:!bg-white/10 disabled:!text-zinc-500'
                        : 'disabled:!bg-mist disabled:!text-graphite'
                    } disabled:!opacity-100`}
                    // One checkout at a time: every plan waits while a payment window is open.
                    disabled={!canBuy || buy.isPending}
                    isLoading={buy.isPending && buy.variables === plan.id}
                    onClick={() => buy.mutate(plan.id)}
                    icon={<Crown size={16} aria-hidden />}
                  >
                    {isMember ? 'Renew' : 'Join Plus'}
                  </Button>
                ) : (
                  <ButtonLink
                    to="/login"
                    size="lg"
                    state={{ from: location.pathname }}
                    className="w-full"
                  >
                    Log in to join
                  </ButtonLink>
                )
              }
            />
          ))}
        </div>
        <p className="mt-5 text-center text-xs text-graphite">
          Prepaid for a fixed period, never renews automatically. Cancel within{' '}
          {membershipRules.refundWindowDays} days for a full refund, before any order uses the
          benefits. See the{' '}
          <Link to="/policies/membership" className="underline underline-offset-2">
            Plus terms
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
