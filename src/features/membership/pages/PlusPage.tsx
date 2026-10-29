import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Check, Crown } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageHeading } from '@/components/ui/PageHeading';
import { useAuth } from '@/features/auth';
import { getErrorMessage } from '@/lib/httpClient';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { memberBenefits, membershipRules } from '../config';
import {
  useBuyMembership,
  useCancelMembership,
  useMembership,
  usePlans,
} from '../hooks/useMembership';
import type { MembershipPlan, MembershipSummary } from '../types';

function MemberStatus({ membership }: { membership: MembershipSummary }) {
  const cancel = useCancelMembership();
  const [isConfirming, setIsConfirming] = useState(false);
  const { current } = membership;

  return (
    <Card aria-labelledby="status-heading" className="mb-8">
      <h2 id="status-heading" className="flex items-center gap-2 text-lg font-semibold text-ink">
        <Crown size={20} aria-hidden /> You&apos;re a Plus member
      </h2>
      <p className="mt-2 text-sm text-graphite">
        {current?.label ?? 'Plus'} · valid until {formatDate(membership.endsAt)} (
        {membership.daysLeft} {membership.daysLeft === 1 ? 'day' : 'days'} left)
      </p>
      <p className="mt-1 text-sm text-graphite">
        Saved so far:{' '}
        <strong className="text-ink">{formatCurrency(membership.savings.amount)}</strong> on
        delivery across {membership.savings.orders}{' '}
        {membership.savings.orders === 1 ? 'order' : 'orders'}.
      </p>

      {cancel.isError && (
        <Alert variant="error" className="mt-4">
          {getErrorMessage(cancel.error, 'Could not cancel your membership.')}
        </Alert>
      )}
      {current?.canRefund ? (
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={() => setIsConfirming(true)}>
            Cancel and get a refund
          </Button>
          <p className="mt-2 text-xs text-graphite">
            Available until {formatDate(current.refundDeadline)}, as long as no order has used your
            Plus benefits yet.
          </p>
        </div>
      ) : (
        <p className="mt-4 text-xs text-graphite">
          Memberships can be cancelled for a full refund within {membershipRules.refundWindowDays}{' '}
          days, before any order uses the benefits. See the{' '}
          <Link to="/policies/membership" className="underline underline-offset-2">
            Plus terms
          </Link>
          .
        </p>
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
    </Card>
  );
}

function PlanCard({
  plan,
  isBestValue,
  action,
}: {
  plan: MembershipPlan;
  isBestValue: boolean;
  action: React.ReactNode;
}) {
  const perMonth = Math.round(plan.price / (plan.durationDays / 30));
  return (
    <Card className={isBestValue ? 'border-brand-400 ring-1 ring-brand-400' : ''}>
      {isBestValue && (
        <p className="mb-2 inline-block rounded-full bg-brand-400 px-2.5 py-0.5 text-xs font-semibold text-ink">
          Best value
        </p>
      )}
      <h3 className="text-lg font-semibold text-ink">{plan.label}</h3>
      <p className="mt-2 text-3xl font-bold text-ink">{formatCurrency(plan.price)}</p>
      <p className="text-sm text-graphite">
        for {plan.durationDays} days · about {formatCurrency(perMonth)} / month
      </p>
      <div className="mt-5">{action}</div>
    </Card>
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
  const canBuy = !isAuthenticated || summary?.canBuy !== false;
  const justJoined = buy.data?.isMember === true;
  const bestValueId = [...plans.data].sort(
    (a, b) => a.price / a.durationDays - b.price / b.durationDays,
  )[0]?.id;

  return (
    <div className="container max-w-3xl pt-8 sm:pt-10">
      <PageHeading description="Free delivery, faster shipping and more points on every order.">
        Webvoltz Plus
      </PageHeading>

      {justJoined && (
        <Alert variant="success" className="mb-6">
          Welcome to Plus! Your benefits are active and your {membershipRules.welcomeBonusPoints}{' '}
          welcome points are in your account.
        </Alert>
      )}
      {buy.isError && (
        <Alert variant="error" className="mb-6">
          {getErrorMessage(buy.error, 'Could not complete your payment.')}
        </Alert>
      )}
      {summary?.isMember && <MemberStatus membership={summary} />}

      <ul className="mb-8 space-y-2 rounded-xl border border-line bg-white p-5 text-[15px] text-ink">
        {memberBenefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2">
            <Check size={18} className="mt-0.5 shrink-0 text-green-700" aria-hidden />
            {benefit}
          </li>
        ))}
      </ul>

      <h2 className="mb-3 text-lg font-semibold text-ink">
        {summary?.isMember ? 'Renew your membership' : 'Choose a plan'}
      </h2>
      {!canBuy && (
        <p className="mb-3 text-sm text-graphite">
          You can renew in the last {membershipRules.renewalWindowDays} days of your membership.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {plans.data.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isBestValue={plan.id === bestValueId}
            action={
              isAuthenticated ? (
                <Button
                  className="w-full"
                  disabled={!canBuy}
                  isLoading={buy.isPending && buy.variables === plan.id}
                  onClick={() => buy.mutate(plan.id)}
                  icon={<Crown size={16} aria-hidden />}
                >
                  {summary?.isMember ? 'Renew' : 'Join Plus'}
                </Button>
              ) : (
                <ButtonLink to="/login" state={{ from: location.pathname }} className="w-full">
                  Log in to join
                </ButtonLink>
              )
            }
          />
        ))}
      </div>
      <p className="mt-4 text-xs text-graphite">
        Memberships are prepaid for a fixed period and don&apos;t renew automatically. See the{' '}
        <Link to="/policies/membership" className="underline underline-offset-2">
          Plus terms
        </Link>
        .
      </p>
    </div>
  );
}
