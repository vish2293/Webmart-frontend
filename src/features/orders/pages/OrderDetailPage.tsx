import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Banknote, CreditCard, IndianRupee, ShoppingBag, Truck } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PriceSummary } from '@/components/ui/PriceSummary';
import { useAuth } from '@/features/auth';
import { ApiError, getErrorMessage } from '@/lib/httpClient';
import { OrderActions } from '../components/OrderActions';
import { OrderItemsList } from '../components/OrderItemsList';
import { OrderSection } from '../components/OrderSection';
import { PaymentDetails } from '../components/PaymentDetails';
import { PaymentHold } from '../components/PaymentHold';
import { CancelledBadge, RefundedBadge, StatusBadge } from '../components/StatusBadge';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import {
  useOrder,
  useRazorpayPayment,
  useStripePayment,
  useSwitchToCashOnDelivery,
  useSyncStripePayment,
} from '../hooks/useOrders';
import type { CancelReason, CheckoutOutcome, Order } from '../types';

const cancelledMessages: Record<CancelReason, string> = {
  payment_expired:
    "This order was cancelled because payment wasn't completed in time. The items have been released; please place a new order.",
  customer: 'You cancelled this order.',
  admin: 'This order was cancelled by the store.',
};

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
      {outcome.kind === 'paymentFailed'
        ? `${outcome.message} If any amount was deducted, it is refunded automatically. `
        : 'Payment not completed, so nothing was charged. '}
      Use Retry payment below to try again, or cancel the order.
    </Alert>
  );
}

function OrderDetail({ order }: { order: Order }) {
  const checkoutOutcome = readCheckoutOutcome(useLocation().state);
  const { user, isAdmin } = useAuth();
  const razorpayPayment = useRazorpayPayment();
  const stripePayment = useStripePayment();
  const syncStripe = useSyncStripePayment();
  const [searchParams, setSearchParams] = useSearchParams();
  const stripeReturn = searchParams.get('stripe');
  const switchToCod = useSwitchToCashOnDelivery();
  const [isConfirmingCod, setIsConfirmingCod] = useState(false);

  const ownerId = typeof order.user === 'string' ? order.user : order.user?._id;
  const isCashOnDelivery = order.paymentMethod === 'Cash on Delivery';
  const isCancelled = order.isCancelled === true;
  const isOpen = !order.isPaid && !isCancelled;
  // The server only lets the customer who placed the order pay for it.
  const isOwner = ownerId === user?._id;
  const canPayOnline = isOpen && !isCashOnDelivery && isOwner;
  const isStripeOrder = order.paymentMethod === 'Stripe';
  const actionError =
    razorpayPayment.error ?? stripePayment.error ?? syncStripe.error ?? switchToCod.error;
  const justPaid = razorpayPayment.data?.isPaid === true || syncStripe.data?.isPaid === true;
  // The customer closed the Razorpay window on this page (the mutation resolves with null).
  const dismissedHere = razorpayPayment.data === null;
  const hasTriedPaying =
    razorpayPayment.isError ||
    stripePayment.isError ||
    stripeReturn === 'cancelled' ||
    dismissedHere ||
    checkoutOutcome?.kind === 'paymentDismissed' ||
    checkoutOutcome?.kind === 'paymentFailed';
  // Stripe sends the customer back with ?stripe=success; confirm it with the server once, then
  // drop the flag so a reload doesn't repeat it.
  const hasSynced = useRef(false);
  useEffect(() => {
    if (stripeReturn !== 'success' || hasSynced.current) return;
    hasSynced.current = true;
    if (!order.isPaid) syncStripe.mutate(order._id);
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per return from Stripe
  }, [stripeReturn]);

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
      {syncStripe.isPending && (
        <Alert variant="success" className="mb-6">
          Confirming your payment with Stripe…
        </Alert>
      )}
      {stripeReturn === 'cancelled' && !actionError && !order.isPaid && (
        <Alert variant="error" className="mb-6">
          Payment cancelled, so nothing was charged. Use Retry payment below to try again, or cancel
          the order.
        </Alert>
      )}
      {dismissedHere && !actionError && (
        <Alert variant="error" className="mb-6">
          Payment not completed, so nothing was charged. Use Retry payment below to try again, or
          cancel the order.
        </Alert>
      )}
      {checkoutOutcome && !dismissedHere && !justPaid && !actionError && (
        <CheckoutOutcomeAlert outcome={checkoutOutcome} order={order} />
      )}
      {justPaid && (
        <Alert variant="success" className="mb-6">
          Payment received. Thank you for your order!
        </Alert>
      )}
      {canPayOnline && !justPaid && <PaymentHold createdAt={order.createdAt} />}
      {isCancelled && (
        <Alert variant="error" className="mb-6">
          {cancelledMessages[order.cancelReason ?? 'payment_expired']}
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
            <p className="mb-2 text-graphite">
              {order.deliveryOption === 'express' ? 'Express delivery' : 'Standard delivery'}
              {order.estimatedDeliveryDate &&
                !order.isDelivered &&
                !isCancelled &&
                ` · expected by ${formatDate(order.estimatedDeliveryDate)}`}
              {order.memberBenefitsApplied && ' · Plus benefits applied'}
            </p>
            <StatusBadge
              isDone={order.isDelivered || order.isShipped === true}
              doneLabel={order.isDelivered ? 'Delivered on' : 'Shipped on'}
              pendingLabel="Not shipped yet"
              date={order.isDelivered ? order.deliveredAt : order.shippedAt}
            />
          </OrderSection>

          <OrderSection
            icon={<CreditCard size={18} className="text-ink" aria-hidden />}
            title="Payment"
          >
            <p className="mb-2 text-graphite">Method: {order.paymentMethod}</p>
            {isCancelled ? (
              <CancelledBadge />
            ) : order.refundedAt ? (
              <RefundedBadge />
            ) : (
              <StatusBadge
                isDone={order.isPaid}
                doneLabel="Paid on"
                pendingLabel={isCashOnDelivery ? 'Pay on delivery' : 'Payment pending'}
                date={order.paidAt}
              />
            )}
            <PaymentDetails order={order} isAdmin={isAdmin} />
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
          expressDeliveryPrice={order.expressDeliveryPrice}
          memberSavings={order.memberSavings}
          taxPrice={order.taxPrice}
          totalPrice={order.totalPrice}
          firstOrderDiscount={order.firstOrderDiscount}
          couponDiscount={order.couponDiscount}
          couponCode={order.couponCode}
          pointsDiscount={order.pointsDiscount}
          pointsRedeemed={order.pointsRedeemed}
        >
          {canPayOnline && user && (
            <Button
              variant="success"
              className="w-full"
              isLoading={razorpayPayment.isPending || stripePayment.isPending}
              onClick={() =>
                isStripeOrder
                  ? stripePayment.mutate(order._id)
                  : razorpayPayment.mutate({
                      orderId: order._id,
                      payer: { name: user.name, email: user.email },
                      paymentMethod: order.paymentMethod,
                    })
              }
              icon={<IndianRupee size={18} aria-hidden />}
            >
              {hasTriedPaying ? 'Retry payment' : 'Pay'} {formatCurrency(order.totalPrice)}
            </Button>
          )}
          {canPayOnline && (
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setIsConfirmingCod(true)}
              icon={<Banknote size={18} aria-hidden />}
            >
              Pay cash on delivery instead
            </Button>
          )}
          {isCashOnDelivery && isOpen && !isAdmin && (
            <p className="text-center text-sm text-graphite">
              Pay in cash when your order is delivered.
            </p>
          )}
          <OrderActions order={order} viewer={{ isAdmin, isOwner }} />
        </PriceSummary>

        <ConfirmDialog
          isOpen={isConfirmingCod}
          title="Pay cash on delivery?"
          description="Your order stays as placed and you pay in cash when it arrives. You can't switch back to paying online afterwards."
          confirmLabel="Pay on delivery"
          isConfirming={switchToCod.isPending}
          onCancel={() => setIsConfirmingCod(false)}
          onConfirm={() =>
            switchToCod.mutate(order._id, { onSettled: () => setIsConfirmingCod(false) })
          }
        />
      </div>
    </div>
  );
}
