import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { PageHeading } from '@/components/ui/PageHeading';
import { useAllOrders, type Order } from '@/features/orders';
import { getErrorMessage } from '@/lib/httpClient';
import { formatCurrency } from '@/utils/formatCurrency';
import { useUsers } from '../hooks/useUsers';

function summarizeOrders(allOrders: Order[]) {
  // Expired orders never happened commercially; their stock was released.
  const orders = allOrders.filter((order) => !order.isCancelled);
  // Refunded money isn't revenue.
  const paidOrders = orders.filter((order) => order.isPaid && !order.refundedAt);
  return {
    totalOrders: orders.length,
    paidRevenue: paidOrders.reduce((sum, order) => sum + order.totalPrice, 0),
    pendingRevenue: orders
      .filter((order) => !order.isPaid)
      .reduce((sum, order) => sum + order.totalPrice, 0),
    awaitingDelivery: orders.filter((order) => !order.isDelivered).length,
  };
}

export default function SalesReportsPage() {
  const ordersQuery = useAllOrders();
  const usersQuery = useUsers();

  if (ordersQuery.isPending || usersQuery.isPending) {
    return <LoadingState label="Loading reports…" />;
  }
  if (ordersQuery.isError || usersQuery.isError) {
    return (
      <ErrorState
        message={getErrorMessage(ordersQuery.error ?? usersQuery.error)}
        onRetry={() => {
          void ordersQuery.refetch();
          void usersQuery.refetch();
        }}
      />
    );
  }

  const summary = summarizeOrders(ordersQuery.data);
  const stats = [
    { label: 'Paid revenue', value: formatCurrency(summary.paidRevenue) },
    { label: 'Awaiting payment', value: formatCurrency(summary.pendingRevenue) },
    { label: 'Orders', value: summary.totalOrders.toLocaleString('en-IN') },
    { label: 'Awaiting delivery', value: summary.awaitingDelivery.toLocaleString('en-IN') },
    { label: 'Customers', value: usersQuery.data.length.toLocaleString('en-IN') },
  ];

  return (
    <div className="container pt-8 sm:pt-10">
      <PageHeading description="All-time totals">Sales</PageHeading>
      <dl className="grid overflow-hidden rounded-xl border border-line sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`bg-white p-5 ${index > 0 ? 'border-t border-line sm:border-t-0 sm:border-l' : ''}`}
          >
            <dt className="text-[13px] text-graphite">{stat.label}</dt>
            <dd className="mt-1 text-xl font-bold tabular-nums tracking-display text-ink">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
