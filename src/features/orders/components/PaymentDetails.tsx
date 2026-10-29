import { RotateCcw } from 'lucide-react';
import { getErrorMessage } from '@/lib/httpClient';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { useRetryRefund } from '../hooks/useOrders';
import type { Order, RefundStatus } from '../types';
import { formatPaymentMethod, refundReasonLabels, refundStatusLabels } from '../utils/orderActions';

const refundStatusTone: Record<RefundStatus, string> = {
  pending: 'bg-brand-50 text-ink',
  processed: 'bg-green-50 text-green-800',
  failed: 'bg-red-50 text-red-800',
  manual_required: 'bg-mist text-ink',
};

/** How the order was paid, rewards on it, and every refund with its status. */
export function PaymentDetails({ order, isAdmin }: { order: Order; isAdmin: boolean }) {
  const retryRefund = useRetryRefund();
  const method = formatPaymentMethod(order.paymentResult?.method);
  const paymentId = order.paymentResult?.id;
  const refunds = order.refunds ?? [];
  const hasRewards = (order.pointsRedeemed ?? 0) > 0 || (order.pointsEarned ?? 0) > 0;

  if (!method && !paymentId && !hasRewards && refunds.length === 0) return null;

  return (
    <div className="mt-3 space-y-3 text-sm">
      {(method || paymentId?.startsWith('pay_')) && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-graphite">
          {method && (
            <>
              <dt>Paid with</dt>
              <dd className="text-ink">{method}</dd>
            </>
          )}
          {paymentId?.startsWith('pay_') && (
            <>
              <dt>Payment ID</dt>
              <dd className="break-all font-mono text-xs text-ink">{paymentId}</dd>
            </>
          )}
        </dl>
      )}

      {hasRewards && (
        <p className="text-graphite">
          {(order.pointsRedeemed ?? 0) > 0 && <>Used {order.pointsRedeemed} points. </>}
          {(order.pointsEarned ?? 0) > 0 && <>Earned {order.pointsEarned} points.</>}
        </p>
      )}

      {refunds.length > 0 && (
        <div>
          <h4 className="mb-1 font-semibold text-ink">Refunds</h4>
          <ul className="space-y-2">
            {refunds.map((refund) => (
              <li
                key={refund.paymentId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line p-2.5"
              >
                <span>
                  <span className="font-medium text-ink">{formatCurrency(refund.amount)}</span>
                  <span className="ml-2 text-graphite">
                    {refundReasonLabels[refund.reason]} · {formatDate(refund.requestedAt)}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${refundStatusTone[refund.status]}`}
                  >
                    {refundStatusLabels[refund.status]}
                  </span>
                  {isAdmin && refund.status === 'failed' && (
                    <button
                      type="button"
                      disabled={retryRefund.isPending}
                      onClick={() =>
                        retryRefund.mutate({ orderId: order._id, paymentId: refund.paymentId })
                      }
                      className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-xs font-semibold text-ink hover:border-ink disabled:opacity-50"
                    >
                      <RotateCcw size={12} aria-hidden /> Retry
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
          {retryRefund.isError && (
            <p role="alert" className="mt-2 text-xs text-red-700">
              {getErrorMessage(retryRefund.error)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
