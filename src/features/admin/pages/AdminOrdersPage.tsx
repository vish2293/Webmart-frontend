import { useState } from 'react';
import { Package, Truck } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageHeading } from '@/components/ui/PageHeading';
import { OrdersTable, useAllOrders, useDeliverOrder, type Order } from '@/features/orders';
import { getErrorMessage } from '@/lib/httpClient';

export default function AdminOrdersPage() {
  const ordersQuery = useAllOrders();
  const deliverOrder = useDeliverOrder();
  const [orderToDeliver, setOrderToDeliver] = useState<Order | null>(null);

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
    return (
      <OrdersTable
        orders={ordersQuery.data}
        showCustomer
        renderActions={(order) =>
          !order.isDelivered &&
          !order.isCancelled && (
            <button
              type="button"
              onClick={() => setOrderToDeliver(order)}
              className="inline-flex items-center gap-1 h-8 rounded-md border border-line px-2.5 text-[13px] font-semibold text-ink hover:border-ink"
            >
              <Truck size={16} aria-hidden />
              Deliver<span className="sr-only"> order {order._id.slice(-8)}</span>
            </button>
          )
        }
      />
    );
  };

  return (
    <div className="container pt-8 sm:pt-10">
      <PageHeading>All orders</PageHeading>
      {deliverOrder.isError && (
        <Alert variant="error" className="mb-6">
          {getErrorMessage(deliverOrder.error, 'Failed to mark order as delivered.')}
        </Alert>
      )}
      {renderContent()}
      <ConfirmDialog
        isOpen={orderToDeliver !== null}
        title="Confirm delivery"
        description={
          orderToDeliver && !orderToDeliver.isPaid
            ? 'This order is not paid yet. Mark it as delivered anyway?'
            : 'Mark this order as delivered?'
        }
        confirmLabel="Mark delivered"
        isConfirming={deliverOrder.isPending}
        onCancel={() => setOrderToDeliver(null)}
        onConfirm={() => {
          if (!orderToDeliver) return;
          deliverOrder.mutate(orderToDeliver._id, { onSettled: () => setOrderToDeliver(null) });
        }}
      />
    </div>
  );
}
