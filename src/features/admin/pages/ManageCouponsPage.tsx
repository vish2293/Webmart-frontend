import { useState } from 'react';
import { Plus, Tag, Trash2 } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageHeading } from '@/components/ui/PageHeading';
import { getErrorMessage } from '@/lib/httpClient';
import { formatCurrencyWhole } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import type { AdminCoupon } from '../api/couponsApi';
import { CouponForm } from '../components/CouponForm';
import { useCoupons, useCreateCoupon, useDeleteCoupon, useUpdateCoupon } from '../hooks/useCoupons';

const headerCell = 'px-4 py-2.5 text-left text-xs font-medium text-graphite';

function describeDiscount(coupon: AdminCoupon) {
  if (coupon.type === 'fixed') return `${formatCurrencyWhole(coupon.value)} off`;
  const cap = coupon.maxDiscount ? `, up to ${formatCurrencyWhole(coupon.maxDiscount)}` : '';
  return `${coupon.value}% off${cap}`;
}

/** Live, scheduled, expired or switched off, as a customer would experience it right now. */
function statusOf(coupon: AdminCoupon, now = Date.now()) {
  if (!coupon.isActive) return { label: 'Off', classes: 'bg-mist text-graphite' };
  if (coupon.expiresAt && Date.parse(coupon.expiresAt) <= now) {
    return { label: 'Expired', classes: 'bg-red-50 text-red-700' };
  }
  if (coupon.startsAt && Date.parse(coupon.startsAt) > now) {
    return { label: 'Scheduled', classes: 'bg-brand-50 text-ink' };
  }
  if (coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
    return { label: 'Fully used', classes: 'bg-mist text-graphite' };
  }
  return { label: 'Live', classes: 'bg-green-100 text-green-800' };
}

export default function ManageCouponsPage() {
  const couponsQuery = useCoupons();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();
  const [isCreating, setIsCreating] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<AdminCoupon | null>(null);

  const actionError = createCoupon.error ?? updateCoupon.error ?? deleteCoupon.error;

  const renderList = () => {
    if (couponsQuery.isPending) return <LoadingState label="Loading coupons…" />;
    if (couponsQuery.isError) {
      return (
        <ErrorState
          message={getErrorMessage(couponsQuery.error)}
          onRetry={() => couponsQuery.refetch()}
        />
      );
    }
    if (couponsQuery.data.length === 0) {
      return (
        <EmptyState
          icon={<Tag size={28} aria-hidden />}
          title="No coupons yet"
          description="Create one and customers can enter its code at checkout."
        />
      );
    }
    return (
      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full min-w-[760px] divide-y divide-line text-sm">
          <thead className="bg-mist">
            <tr>
              <th scope="col" className={headerCell}>
                Code
              </th>
              <th scope="col" className={headerCell}>
                Discount
              </th>
              <th scope="col" className={headerCell}>
                Rules
              </th>
              <th scope="col" className={headerCell}>
                Used
              </th>
              <th scope="col" className={headerCell}>
                Valid
              </th>
              <th scope="col" className={headerCell}>
                Status
              </th>
              <th scope="col" className={`${headerCell} text-right`}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {couponsQuery.data.map((coupon) => {
              const status = statusOf(coupon);
              return (
                <tr key={coupon._id} className="hover:bg-mist/60">
                  <td className="px-4 py-3">
                    <p className="font-mono text-[13px] font-semibold text-ink">{coupon.code}</p>
                    {coupon.description && (
                      <p className="text-xs text-graphite">{coupon.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">{describeDiscount(coupon)}</td>
                  <td className="px-4 py-3 text-graphite">
                    {coupon.minOrderValue > 0
                      ? `Min ${formatCurrencyWhole(coupon.minOrderValue)} · `
                      : ''}
                    {coupon.perUserLimit} per customer
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {coupon.usedCount}
                    {coupon.usageLimit !== undefined && ` / ${coupon.usageLimit}`}
                  </td>
                  <td className="px-4 py-3 text-graphite">
                    {coupon.startsAt || coupon.expiresAt
                      ? `${coupon.startsAt ? formatDate(coupon.startsAt) : 'Now'} – ${coupon.expiresAt ? formatDate(coupon.expiresAt) : 'No end'}`
                      : 'Always'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.classes}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        isLoading={
                          updateCoupon.isPending && updateCoupon.variables?.couponId === coupon._id
                        }
                        onClick={() =>
                          updateCoupon.mutate({
                            couponId: coupon._id,
                            changes: { isActive: !coupon.isActive },
                          })
                        }
                      >
                        {coupon.isActive ? 'Switch off' : 'Switch on'}
                      </Button>
                      {coupon.usedCount === 0 && (
                        <button
                          type="button"
                          onClick={() => setCouponToDelete(coupon)}
                          className="rounded-full p-2 text-red-600 hover:bg-red-50"
                          aria-label={`Delete ${coupon.code}`}
                        >
                          <Trash2 size={18} aria-hidden />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container pt-8 sm:pt-10">
      <PageHeading
        description="Discount codes customers enter at checkout"
        actions={
          !isCreating && (
            <Button
              size="sm"
              onClick={() => setIsCreating(true)}
              icon={<Plus size={14} aria-hidden />}
            >
              New coupon
            </Button>
          )
        }
      >
        Coupons
      </PageHeading>

      {actionError && (
        <Alert variant="error" className="mb-6">
          {getErrorMessage(actionError, 'That did not work.')}
        </Alert>
      )}
      {isCreating && (
        <CouponForm
          isSubmitting={createCoupon.isPending}
          onCancel={() => setIsCreating(false)}
          onSubmit={(input) =>
            createCoupon.mutate(input, { onSuccess: () => setIsCreating(false) })
          }
        />
      )}
      {renderList()}

      <ConfirmDialog
        isOpen={couponToDelete !== null}
        title="Delete coupon?"
        description={`${couponToDelete?.code ?? 'This coupon'} will be removed. Coupons that have been used can only be switched off.`}
        confirmLabel="Delete coupon"
        confirmVariant="danger"
        isConfirming={deleteCoupon.isPending}
        onCancel={() => setCouponToDelete(null)}
        onConfirm={() => {
          if (!couponToDelete) return;
          deleteCoupon.mutate(couponToDelete._id, { onSettled: () => setCouponToDelete(null) });
        }}
      />
    </div>
  );
}
