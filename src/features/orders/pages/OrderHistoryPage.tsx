import { Package } from 'lucide-react';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { PageHeading } from '@/components/ui/PageHeading';
import { getErrorMessage } from '@/lib/httpClient';
import { OrdersTable } from '../components/OrdersTable';
import { useMyOrders } from '../hooks/useOrders';

export default function OrderHistoryPage() {
  const ordersQuery = useMyOrders();

  const renderContent = () => {
    if (ordersQuery.isPending) return <LoadingState label="Loading your orders…" />;
    if (ordersQuery.isError) {
      return (
        <ErrorState
          message={getErrorMessage(ordersQuery.error)}
          onRetry={() => ordersQuery.refetch()}
        />
      );
    }
    if (ordersQuery.data.length === 0) {
      return (
        <EmptyState
          icon={<Package size={28} aria-hidden />}
          title="You haven't placed any orders yet."
          action={<ButtonLink to="/products">Start shopping</ButtonLink>}
        />
      );
    }
    return <OrdersTable orders={ordersQuery.data} />;
  };

  return (
    <div className="container pt-8 sm:pt-10">
      <PageHeading>My orders</PageHeading>
      {renderContent()}
    </div>
  );
}
