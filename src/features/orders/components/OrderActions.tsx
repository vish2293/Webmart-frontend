import { useState } from 'react';
import { IndianRupee, PackageCheck, RotateCcw, Truck, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { getErrorMessage } from '@/lib/httpClient';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  useCancelOrder,
  useDeliverOrder,
  useMarkOrderPaid,
  useRefundOrder,
  useShipOrder,
} from '../hooks/useOrders';
import type { Order } from '../types';
import { getOrderActions, type OrderViewer } from '../utils/orderActions';

type ConfirmableAction = 'cancel' | 'ship' | 'deliver' | 'refund';

function dialogCopy(action: ConfirmableAction, order: Order, isAdmin: boolean) {
  const total = formatCurrency(order.totalPrice);
  const isPaidOnline = order.isPaid && order.paymentMethod !== 'Cash on Delivery';
  switch (action) {
    case 'cancel':
      return {
        title: 'Cancel this order?',
        description: isPaidOnline
          ? `The order is cancelled and ${total} is refunded to the original payment method.`
          : isAdmin && order.isPaid
            ? 'The order is cancelled. The cash collected must be refunded to the customer manually.'
            : 'The order is cancelled and any points used are returned.',
        confirmLabel: 'Cancel order',
        confirmVariant: 'danger' as const,
      };
    case 'ship':
      return {
        title: 'Mark as shipped?',
        description: 'The customer can no longer cancel the order after it ships.',
        confirmLabel: 'Mark shipped',
      };
    case 'deliver':
      return {
        title: 'Confirm delivery',
        description: 'Mark this order as delivered? Customers will see it as completed.',
        confirmLabel: 'Mark delivered',
      };
    case 'refund':
      return {
        title: `Refund ${total}?`,
        description: order.isShipped
          ? 'The customer gets the full amount and any points they used back; points earned on this order are removed. Items are not restocked.'
          : 'The order is cancelled, items go back into stock, and the full amount is refunded.',
        confirmLabel: 'Refund',
        confirmVariant: 'danger' as const,
      };
  }
}

/** Every action the viewer may take on the order, each behind a confirmation. */
export function OrderActions({ order, viewer }: { order: Order; viewer: OrderViewer }) {
  const actions = getOrderActions(order, viewer);
  const [pending, setPending] = useState<ConfirmableAction | null>(null);
  const mutations = {
    cancel: useCancelOrder(),
    ship: useShipOrder(),
    deliver: useDeliverOrder(),
    refund: useRefundOrder(),
  };
  const markPaid = useMarkOrderPaid();
  const error = [...Object.values(mutations), markPaid].find((mutation) => mutation.isError)?.error;

  const confirm = () => {
    if (!pending) return;
    mutations[pending].mutate(order._id, { onSettled: () => setPending(null) });
  };
  const copy = pending && dialogCopy(pending, order, viewer.isAdmin);

  return (
    <>
      {actions.canMarkPaid && (
        <Button
          variant="success"
          className="w-full"
          isLoading={markPaid.isPending}
          onClick={() => markPaid.mutate(order._id)}
          icon={<IndianRupee size={18} aria-hidden />}
        >
          Mark as paid (cash received)
        </Button>
      )}
      {actions.canShip && (
        <Button
          className="w-full"
          onClick={() => setPending('ship')}
          icon={<Truck size={18} aria-hidden />}
        >
          Mark as shipped
        </Button>
      )}
      {actions.canDeliver && (
        <Button
          className="w-full"
          onClick={() => setPending('deliver')}
          icon={<PackageCheck size={18} aria-hidden />}
        >
          Mark as delivered
        </Button>
      )}
      {actions.canRefund && (
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => setPending('refund')}
          icon={<RotateCcw size={18} aria-hidden />}
        >
          Refund order
        </Button>
      )}
      {actions.canCancel && (
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => setPending('cancel')}
          icon={<XCircle size={18} aria-hidden />}
        >
          Cancel order
        </Button>
      )}
      {error && (
        <p role="alert" className="text-center text-sm text-red-700">
          {getErrorMessage(error)}
        </p>
      )}

      <ConfirmDialog
        isOpen={pending !== null}
        title={copy?.title ?? ''}
        description={copy?.description ?? ''}
        confirmLabel={copy?.confirmLabel ?? ''}
        confirmVariant={copy && 'confirmVariant' in copy ? copy.confirmVariant : undefined}
        isConfirming={pending ? mutations[pending].isPending : false}
        onConfirm={confirm}
        onCancel={() => setPending(null)}
      />
    </>
  );
}
