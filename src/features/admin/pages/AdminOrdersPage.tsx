import { useState } from 'react';
import { Package, PackageCheck, Truck } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageHeading } from '@/components/ui/PageHeading';
import {
  getOrderActions,
  OrdersTable,
  useAllOrders,
  useDeliverOrder,
  useShipOrder,
  type Order,
} from '@/features/orders';
import { getErrorMessage } from '@/lib/httpClient';

type RowAction = { kind: 'ship' | 'deliver'; order: Order };

const rowButtonClasses =
  'inline-flex h-8 items-center gap-1 rounded-md border border-line px-2.5 text-[13px] font-semibold text-ink hover:border-ink';

export default function AdminOrdersPage() {
  const ordersQuery = useAllOrders();
  const shipOrder = useShipOrder();
  const deliverOrder = useDeliverOrder();
  const [pending, setPending] = useState<RowAction | null>(null);
  const activeMutation = pending?.kind === 'ship' ? shipOrder : deliverOrder;
  const error = shipOrder.error ?? deliverOrder.error;

  const renderActions = (order: Order) => {
    const actions = getOrderActions(order, { isAdmin: true, isOwner: false });
    const orderLabel = <span className="sr-only"> order {order._id.slice(-8)}</span>;
    if (actions.canShip) {
      return (
        <button
          type="button"
          onClick={() => setPending({ kind: 'ship', order })}
          className={rowButtonClasses}
        >
          <Truck size={16} aria-hidden />
          Ship{orderLabel}
        </button>
      );
    }
    if (actions.canDeliver) {
      return (
        <button
          type="button"
          onClick={() => setPending({ kind: 'deliver', order })}
          className={rowButtonClasses}
        >
          <PackageCheck size={16} aria-hidden />
          Deliver{orderLabel}
        </button>
      );
    }
    return null;
  };

  const renderContent = () => {
    if (ordersQuery.isPending) return <LoadingState label="Loading orders…" />;
    if (ordersQuery.isError) {
      return (
        <ErrorState
          message={getErrorMessage(ordersQuery.error)}
          onRetry={() => ordersQuery.refetch()}
        />
      );
    }
    if (ordersQuery.data.length === 0) {
      return <EmptyState icon={<Package size={28} aria-hidden />} title="No orders yet." />;
    }
    return <OrdersTable orders={ordersQuery.data} showCustomer renderActions={renderActions} />;
  };

  return (
    <div className="container pt-8 sm:pt-10">
      <PageHeading>All orders</PageHeading>
      {error && (
        <Alert variant="error" className="mb-6">
          {getErrorMessage(error, 'Failed to update the order.')}
        </Alert>
      )}
      {renderContent()}
      <ConfirmDialog
        isOpen={pending !== null}
        title={pending?.kind === 'ship' ? 'Mark as shipped?' : 'Confirm delivery'}
        description={
          pending?.kind === 'ship'
            ? pending.order.isPaid
              ? 'The customer can no longer cancel the order after it ships.'
              : 'This cash-on-delivery order is not paid yet. Ship it now? The customer can no longer cancel it.'
            : 'Mark this order as delivered?'
        }
        confirmLabel={pending?.kind === 'ship' ? 'Mark shipped' : 'Mark delivered'}
        isConfirming={activeMutation.isPending}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (!pending) return;
          activeMutation.mutate(pending.order._id, { onSettled: () => setPending(null) });
        }}
      />
    </div>
  );
}
