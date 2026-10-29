import { useMemo } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { CheckCircle2, CreditCard, Loader2, Lock, MapPin, Pencil, ShoppingBag } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { Button } from '@/components/ui/Button';
import { PriceSummary } from '@/components/ui/PriceSummary';
import { calculateOrderPricing, useCart } from '@/features/cart';
import { useAuth } from '@/features/auth';
import {
  OrderItemsList,
  OrderSection,
  useCreateOrder,
  useRazorpayPayment,
  type CheckoutOutcome,
} from '@/features/orders';
import { policyPath } from '@/features/policies/links';
import { getErrorMessage } from '@/lib/httpClient';
import { formatCurrency } from '@/utils/formatCurrency';
import { CheckoutSteps } from '../components/CheckoutSteps';
import { useFreshCart } from '../hooks/useFreshCart';
import { clearCheckout, getPaymentMethod, getShippingAddress } from '../utils/checkoutStorage';

/** Shown while the Razorpay window is open, so the page behind it isn't blank. */
function PaymentInProgress({ orderNumber }: { orderNumber: string }) {
  return (
    <div className="container flex min-h-[50vh] items-center justify-center py-16">
      <div role="status" className="max-w-sm text-center">
        <Loader2 size={28} className="mx-auto animate-spin text-ink" aria-hidden />
        <h1 className="mt-4 text-xl font-bold tracking-display text-ink">Complete your payment</h1>
        <p className="mt-2 text-sm text-graphite">
          Order #{orderNumber} is placed. Finish paying in the Razorpay window. Please don&apos;t
          close this tab.
        </p>
      </div>
    </div>
  );
}

function EditLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="mt-2 inline-flex items-center gap-1 text-sm text-ink decoration-brand-400 decoration-2 underline-offset-4 hover:underline"
    >
      <Pencil size={14} aria-hidden /> {label}
    </Link>
  );
}

export default function PlaceOrderPage() {
  const { items, clearCart } = useCart();
  const navigate = useNavigate();
  const createOrder = useCreateOrder();
  const razorpayPayment = useRazorpayPayment();
  const { user } = useAuth();
  const shippingAddress = getShippingAddress();
  const paymentMethod = getPaymentMethod();
  const { isChecking, notices } = useFreshCart();

  // One key per distinct order: retries of the same order reuse it (so a double click or a
  // timed-out request can't create two orders); any change to the order gets a new key.
  const orderSignature = JSON.stringify([
    items.map((item) => [item.productId, item.quantity, item.price]),
    shippingAddress,
    paymentMethod,
  ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- new key whenever the order changes
  const idempotencyKey = useMemo(() => crypto.randomUUID(), [orderSignature]);

  // Once placed, the cart empties; don't let the guards below bounce the user to /cart.
  if (createOrder.isSuccess) {
    return <PaymentInProgress orderNumber={createOrder.data._id.slice(-8)} />;
  }
  if (items.length === 0) return <Navigate to="/cart" replace />;
  if (!shippingAddress) return <Navigate to="/checkout/shipping" replace />;
  if (!paymentMethod) return <Navigate to="/checkout/payment" replace />;

  const pricing = calculateOrderPricing(items);
  const isOnlinePayment = paymentMethod !== 'Cash on Delivery';

  const showOrder = (orderId: string, outcome: CheckoutOutcome) =>
    navigate(`/orders/${orderId}`, { replace: true, state: { checkoutOutcome: outcome } });

  /** Opens Razorpay for a just-created order, then shows the order with the result. */
  const payOnline = (orderId: string) => {
    if (!user) return showOrder(orderId, { kind: 'paymentDismissed' });
    razorpayPayment.mutate(
      { orderId, payer: { name: user.name, email: user.email } },
      {
        onSuccess: (paidOrder) =>
          showOrder(orderId, { kind: paidOrder ? 'paid' : 'paymentDismissed' }),
        onError: (error) =>
          showOrder(orderId, {
            kind: 'paymentFailed',
            message: getErrorMessage(error, 'The payment could not be completed.'),
          }),
      },
    );
  };

  const handlePlaceOrder = () => {
    createOrder.mutate(
      {
        idempotencyKey,
        input: {
          orderItems: items.map((item) => ({
            product: item.productId,
            name: item.name,
            qty: item.quantity,
            image: item.imageUrl,
            price: item.price,
          })),
          shippingAddress,
          paymentMethod,
          // The server rejects the order if its total differs from what the customer sees.
          ...pricing,
        },
      },
      {
        onSuccess: (order) => {
          // The order exists now, so the cart is done whether or not payment completes;
          // an unpaid order can still be paid from its page until it expires.
          clearCart();
          clearCheckout();
          if (isOnlinePayment) payOnline(order._id);
          else showOrder(order._id, { kind: 'cashOnDelivery' });
        },
      },
    );
  };

  return (
    <>
      <CheckoutSteps current="Review" />
      <div className="container pt-8">
        {createOrder.isError && (
          <Alert variant="error" className="mb-6">
            {getErrorMessage(createOrder.error, 'Failed to place order. Please try again.')}
          </Alert>
        )}
        {notices.length > 0 && (
          <Alert variant="error" className="mb-6">
            <p className="font-semibold">Your cart was updated. Please review before ordering:</p>
            <ul className="mt-1 list-disc pl-5">
              {notices.map((notice) => (
                <li key={notice}>{notice}</li>
              ))}
            </ul>
          </Alert>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:gap-12">
          <div className="space-y-6 rounded-xl border border-line bg-white p-5 sm:p-6">
            <OrderSection
              icon={<MapPin size={18} className="text-ink" aria-hidden />}
              title="Shipping"
            >
              <p className="text-graphite">
                {shippingAddress.address}, {shippingAddress.city}, {shippingAddress.postalCode},{' '}
                {shippingAddress.country}
              </p>
              <EditLink to="/checkout/shipping" label="Edit shipping address" />
            </OrderSection>

            <OrderSection
              icon={<CreditCard size={18} className="text-ink" aria-hidden />}
              title="Payment"
            >
              <p className="text-graphite">{paymentMethod}</p>
              <EditLink to="/checkout/payment" label="Edit payment method" />
            </OrderSection>

            <OrderSection
              icon={<ShoppingBag size={18} className="text-ink" aria-hidden />}
              title="Items"
            >
              <OrderItemsList
                lines={items.map((item) => ({
                  key: item.productId,
                  name: item.name,
                  imageUrl: item.imageUrl,
                  quantity: item.quantity,
                  price: item.price,
                }))}
              />
            </OrderSection>
          </div>

          <PriceSummary {...pricing}>
            <Button
              className="w-full"
              isLoading={createOrder.isPending}
              // Never submit prices or quantities the catalogue hasn't just confirmed.
              disabled={isChecking}
              onClick={handlePlaceOrder}
              icon={
                isOnlinePayment ? (
                  <Lock size={16} aria-hidden />
                ) : (
                  <CheckCircle2 size={18} aria-hidden />
                )
              }
            >
              {createOrder.isPending
                ? 'Placing order…'
                : isChecking
                  ? 'Checking prices and stock…'
                  : isOnlinePayment
                    ? `Pay ${formatCurrency(pricing.totalPrice)}`
                    : 'Place order'}
            </Button>
            {isOnlinePayment && (
              <p className="text-center text-xs text-graphite">
                Razorpay opens next to securely complete your {paymentMethod.toLowerCase()} payment.
              </p>
            )}
            <p className="text-center text-xs leading-relaxed text-graphite">
              By placing your order you agree to our{' '}
              <Link to={policyPath('terms')} className="underline underline-offset-2">
                Terms &amp; Conditions
              </Link>{' '}
              and{' '}
              <Link to={policyPath('refunds')} className="underline underline-offset-2">
                Refund &amp; Cancellation Policy
              </Link>
              .
            </p>
          </PriceSummary>
        </div>
      </div>
    </>
  );
}
