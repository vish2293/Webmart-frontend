import { useState } from 'react';
import { Crown } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageHeading } from '@/components/ui/PageHeading';
import {
  useAllMemberships,
  useRefundMembership,
  useRetryMembershipRefund,
  type AdminMembership,
} from '@/features/membership';
import { getErrorMessage } from '@/lib/httpClient';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';

const headerCell = 'px-4 py-2.5 text-left text-xs font-medium text-graphite';
const rowButtonClasses =
  'inline-flex h-8 items-center rounded-md border border-line px-2.5 text-[13px] font-semibold text-ink hover:border-ink';

const statusLabels: Record<AdminMembership['status'], string> = {
  pending: 'Awaiting payment',
  active: 'Active',
  expired: 'Expired',
  refunded: 'Refunded',
};

function refundLabel(membership: AdminMembership) {
  if (!membership.refund) return '—';
  const { status, failureReason } = membership.refund;
  if (status === 'failed') return `Failed${failureReason ? `: ${failureReason}` : ''}`;
  return status === 'processed' ? 'Refunded' : 'Refund pending';
}

export default function ManageMembershipsPage() {
  const memberships = useAllMemberships();
  const refund = useRefundMembership();
  const retry = useRetryMembershipRefund();
  const [toRefund, setToRefund] = useState<AdminMembership | null>(null);
  const error = refund.error ?? retry.error;

  const renderContent = () => {
    if (memberships.isPending) return <LoadingState label="Loading memberships…" />;
    if (memberships.isError) {
      return (
        <ErrorState
          message={getErrorMessage(memberships.error)}
          onRetry={() => memberships.refetch()}
        />
      );
    }
    if (memberships.data.length === 0) {
      return <EmptyState icon={<Crown size={28} aria-hidden />} title="No memberships yet." />;
    }
    return (
      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full min-w-[760px] divide-y divide-line text-sm">
          <thead className="bg-mist">
            <tr>
              <th scope="col" className={headerCell}>
                Customer
              </th>
              <th scope="col" className={headerCell}>
                Plan
              </th>
              <th scope="col" className={headerCell}>
                Paid
              </th>
              <th scope="col" className={headerCell}>
                Status
              </th>
              <th scope="col" className={headerCell}>
                Valid until
              </th>
              <th scope="col" className={headerCell}>
                Refund
              </th>
              <th scope="col" className={`${headerCell} text-right`}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {memberships.data.map((membership) => (
              <tr key={membership._id} className="hover:bg-mist/60">
                <td className="px-4 py-3">
                  <span className="block font-medium">{membership.user?.name ?? '—'}</span>
                  <span className="block text-xs text-graphite">{membership.user?.email}</span>
                </td>
                <td className="px-4 py-3 capitalize">{membership.plan}</td>
                <td className="px-4 py-3">
                  {formatCurrency(membership.pricePaid)}
                  <span className="block text-xs text-graphite">
                    {formatDate(membership.paidAt)}
                  </span>
                </td>
                <td className="px-4 py-3">{statusLabels[membership.status]}</td>
                <td className="px-4 py-3">{formatDate(membership.endsAt)}</td>
                <td className="px-4 py-3">{refundLabel(membership)}</td>
                <td className="px-4 py-3 text-right">
                  {membership.status === 'active' && (
                    <button
                      type="button"
                      className={rowButtonClasses}
                      onClick={() => setToRefund(membership)}
                    >
                      Refund
                    </button>
                  )}
                  {membership.refund?.status === 'failed' && (
                    <button
                      type="button"
                      className={rowButtonClasses}
                      disabled={retry.isPending}
                      onClick={() => retry.mutate(membership._id)}
                    >
                      Retry refund
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container pt-8 sm:pt-10">
      <PageHeading description="Plus purchases and refunds">Memberships</PageHeading>
      {error && (
        <Alert variant="error" className="mb-6">
          {getErrorMessage(error)}
        </Alert>
      )}
      {renderContent()}

      <ConfirmDialog
        isOpen={toRefund !== null}
        title="Refund this membership?"
        description={`${toRefund?.user?.name ?? 'The customer'} is refunded ${formatCurrency(toRefund?.pricePaid ?? 0)} and loses their Plus benefits and welcome points immediately.`}
        confirmLabel="Refund"
        confirmVariant="danger"
        isConfirming={refund.isPending}
        onCancel={() => setToRefund(null)}
        onConfirm={() =>
          toRefund && refund.mutate(toRefund._id, { onSettled: () => setToRefund(null) })
        }
      />
    </div>
  );
}
