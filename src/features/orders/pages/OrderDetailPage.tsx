import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, IndianRupee, ShoppingBag, Truck } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PriceSummary } from '@/components/ui/PriceSummary';
import { useAuth } from '@/features/auth';
import { ApiError, getErrorMessage } from '@/lib/httpClient';
import { OrderItemsList } from '../components/OrderItemsList';
import { OrderSection } from '../components/OrderSection';
import { CancelledBadge, StatusBadge } from '../components/StatusBadge';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  useDeliverOrder,
  useMarkOrderPaid,
  useOrder,
  useRazorpayPayment,
} from '../hooks/useOrders';
import type { CheckoutOutcome, Order } from '../types';

export default function OrderDetailPage() {
  const { orderId = '' } = useParams();
  const orderQuery = useOrder(orderId);

  if (orderQuery.isPending) return <LoadingState label="Loading order…" />;
  if (orderQuery.isError) {
    const isNotFound =
      orderQuery.error instanceof ApiError && [400, 403, 404].includes(orderQuery.error.status);
    return (
      <ErrorState
        title={isNotFound ? 'Order not found' : undefined}
        message={
          isNotFound
            ? "We couldn't find this order on your account."
            : getErrorMessage(orderQuery.error)
        }
        onRetry={isNotFound ? undefined : () => orderQuery.refetch()}
        action={
          <ButtonLink to="/orders" variant="secondary">
            My orders
          </ButtonLink>
        }
      />
    );
  }

  return <OrderDetail order={orderQuery.data} />;
}

/** Router state from checkout is untrusted (it survives reloads/history), so validate it. */
function readCheckoutOutcome(state: unknown): CheckoutOutcome | null {
  if (!state || typeof state !== 'object' || !('checkoutOutcome' in state)) return null;
  const outcome = state.checkoutOutcome;
  if (!outcome || typeof outcome !== 'object' || !('kind' in outcome)) return null;
  switch (outcome.kind) {
    case 'paid':
    case 'cashOnDelivery':
    case 'paymentDismissed':
      return { kind: outcome.kind };
    case 'paymentFailed':
      return {
        kind: 'paymentFailed',
        message:
          'message' in outcome && typeof outcome.message === 'string'
            ? outcome.message
            : 'The payment could not be completed.',
      };
    default:
      return null;
  }
}

function CheckoutOutcomeAlert({ outcome, order }: { outcome: CheckoutOutcome; order: Order }) {
  if (outcome.kind === 'cashOnDelivery') {
    return (
      <Alert variant="success" className="mb-6">
        Order placed. Pay in cash when it&apos;s delivered.
      </Alert>
    );
  }
  // Fresh data wins over the checkout message (e.g. the webhook confirmed it meanwhile).
  if (outcome.kind === 'paid' || order.isPaid) {
    return (
      <Alert variant="success" className="mb-6">
        Payment received. Thank you for your order!
      </Alert>
    );
  }
  if (order.isCancelled) return null;
  return (
    <Alert variant="error" className="mb-6">
      {outcome.kind === 'paymentFailed' ? `${outcome.message} ` : 'Payment was not completed. '}
      Your order is reserved — use the Pay button below to finish paying before it expires.
    </Alert>
  );
}

function OrderDetail({ order }: { order: Order }) {
  const checkoutOutcome = readCheckoutOutcome(useLocation().state);
  const { user, isAdmin } = useAuth();
  const razorpayPayment = useRazorpayPayment();
  const markOrderPaid = useMarkOrderPaid();
  const deliverOrder = useDeliverOrder();
  const [isConfirmingDelivery, setIsConfirmingDelivery] = useState(false);

  const ownerId = typeof order.user === 'string' ? order.user : order.user?._id;
  const isCashOnDelivery = order.paymentMethod === 'Cash on Delivery';
  const isCancelled = order.isCancelled === true;
  const isOpen = !order.isPaid && !isCancelled;
  // The server only lets the customer who placed the order pay for it.
  const canPayOnline = isOpen && !isCashOnDelivery && ownerId === user?._id;
  const actionError = razorpayPayment.error ?? markOrderPaid.error ?? deliverOrder.error;
  const justPaid = razorpayPayment.data?.isPaid === true;
  const { address, city, postalCode, country } = order.shippingAddress;
  const itemsPrice =
    order.itemsPrice ?? order.orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="container pt-8 sm:pt-10">
      <Link
        to="/orders"
        className="mb-4 inline-flex items-center gap-1 text-ink decoration-brand-400 decoration-2 underline-offset-4 hover:underline"
      >
        <ArrowLeft size={18} aria-hidden /> Back to my orders
      </Link>
      <h1 className="mb-8 text-[28px] font-bold leading-tight tracking-display text-ink">
        Order #{order._id.slice(-8)}
      </h1>

      {actionError && (
        <Alert variant="error" className="mb-6">
          {getErrorMessage(actionError)}
        </Alert>
      )}
      {checkoutOutcome && !justPaid && !actionError && (
        <CheckoutOutcomeAlert outcome={checkoutOutcome} order={order} />
      )}
      {justPaid && (
        <Alert variant="success" className="mb-6">
          Payment received. Thank you for your order!
        </Alert>
      )}
      {isCancelled && (
        <Alert variant="error" className="mb-6">
          This order was cancelled because payment wasn&apos;t completed in time. The items have
          been released; please place a new order.
        </Alert>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:gap-12">
        <div className="space-y-6 rounded-xl border border-line bg-white p-5 sm:p-6">
          <OrderSection
            icon={<Truck size={18} className="text-ink" aria-hidden />}
            title="Shipping"
          >
            <p className="mb-2 text-graphite">
              {address}, {city}, {postalCode}, {country}
            </p>
            <StatusBadge
              isDone={order.isDelivered}
              doneLabel="Delivered on"
              pendingLabel="Not delivered yet"
              date={order.deliveredAt}
            />
          </OrderSection>

          <OrderSection
            icon={<CreditCard size={18} className="text-ink" aria-hidden />}
            title="Payment"
          >
            <p className="mb-2 text-graphite">Method: {order.paymentMethod}</p>
            {isCancelled ? (
              <CancelledBadge />
            ) : (
              <StatusBadge
                isDone={order.isPaid}
                doneLabel="Paid on"
                pendingLabel="Not paid"
                date={order.paidAt}
              />
            )}
          </OrderSection>

          <OrderSection
            icon={<ShoppingBag size={18} className="text-ink" aria-hidden />}
            title="Items"
          >
            <OrderItemsList
              lines={order.orderItems.map((item) => ({
                key: item.product,
                name: item.name,
                imageUrl: item.image,
                quantity: item.qty,
                price: item.price,
                title: (
                  <Link
                    to={`/products/${item.product}`}
                    className="decoration-brand-400 decoration-2 underline-offset-4 hover:underline"
                  >
                    {item.name}
                  </Link>
                ),
              }))}
            />
          </OrderSection>
        </div>

        <PriceSummary
          itemsPrice={itemsPrice}
          shippingPrice={order.shippingPrice}
          taxPrice={order.taxPrice}
          totalPrice={order.totalPrice}
        >
          {canPayOnline && user && (
            <Button
              variant="success"
              className="w-full"
              isLoading={razorpayPayment.isPending}
              onClick={() =>
                razorpayPayment.mutate({
                  orderId: order._id,
                  payer: { name: user.name, email: user.email },
                })
              }
              icon={<IndianRupee size={18} aria-hidden />}
            >
              Pay {formatCurrency(order.totalPrice)}
            </Button>
          )}
          {isCashOnDelivery && isOpen && !isAdmin && (
            <p className="text-center text-sm text-graphite">
              Pay in cash when your order is delivered.
            </p>
          )}
          {isAdmin && isCashOnDelivery && isOpen && (
            <Button
              variant="success"
              className="w-full"
              isLoading={markOrderPaid.isPending}
              onClick={() => markOrderPaid.mutate(order._id)}
              icon={<IndianRupee size={18} aria-hidden />}
            >
              Mark as paid (cash received)
            </Button>
          )}
          {isAdmin && order.isPaid && !order.isDelivered && (
            <Button
              className="w-full"
              onClick={() => setIsConfirmingDelivery(true)}
              icon={<Truck size={18} aria-hidden />}
            >
              Mark as delivered
            </Button>
          )}
        </PriceSummary>
      </div>

      <ConfirmDialog
        isOpen={isConfirmingDelivery}
        title="Confirm delivery"
        description="Mark this order as delivered? Customers will see it as completed."
        confirmLabel="Mark delivered"
        isConfirming={deliverOrder.isPending}
        onConfirm={() =>
          deliverOrder.mutate(order._id, { onSettled: () => setIsConfirmingDelivery(false) })
        }
        onCancel={() => setIsConfirmingDelivery(false)}
      />
    </div>
  );
}
