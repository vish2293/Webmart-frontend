import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, Lock } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { Button } from '@/components/ui/Button';
import { PriceSummary } from '@/components/ui/PriceSummary';
import { calculateOrderPricing, useCart } from '@/features/cart';
import { useAuth } from '@/features/auth';
import {
  OrderItemsList,
  useCreateOrder,
  useOrderQuote,
  usePaymentOptions,
  useRazorpayPayment,
  useStripePayment,
  type CheckoutOutcome,
  type DeliveryOption,
  type OrderPricing,
  type PaymentMethod,
  type ShippingAddress,
} from '@/features/orders';
import { PlusNudge } from '@/features/membership';
import { useRewards } from '@/features/rewards';
import { policyPath } from '@/features/policies/links';
import { getErrorMessage } from '@/lib/httpClient';
import { formatCurrency } from '@/utils/formatCurrency';
import { CheckoutStepCard, type StepState } from '../components/CheckoutStepCard';
import { PaymentStep } from '../components/PaymentStep';
import { CouponField } from '../components/CouponField';
import { PointsRedeemer } from '../components/PointsRedeemer';
import { ShippingStep } from '../components/ShippingStep';
import { StockConflictNotice } from '../components/StockConflictNotice';
import { useFreshCart } from '../hooks/useFreshCart';
import {
  clearCheckout,
  getPaymentMethod,
  getShippingAddress,
  savePaymentMethod,
  saveShippingAddress,
} from '../utils/checkoutStorage';
import { readStockConflict } from '../utils/stockConflict';

type Step = 'shipping' | 'payment' | 'review';

/** Shown while a payment window opens (Razorpay) or the browser leaves (Stripe), so the page isn't blank. */
function PaymentInProgress({
  orderNumber,
  isStripe,
}: Readonly<{ orderNumber: string; isStripe: boolean }>) {
  return (
    <div className="container flex min-h-[50vh] items-center justify-center py-16">
      <div role="status" className="max-w-sm text-center">
        <Loader2 size={28} className="mx-auto animate-spin text-ink" aria-hidden />
        <h1 className="mt-4 text-xl font-bold tracking-display text-ink">Complete your payment</h1>
        <p className="mt-2 text-sm text-graphite">
          {isStripe
            ? 'Taking you to Stripe’s secure payment page. Your items are held while you pay.'
            : 'Your items are held while you pay. Finish paying in the Razorpay window; the order is confirmed once the payment succeeds. Please don’t close this tab.'}{' '}
          (Ref #{orderNumber})
        </p>
      </div>
    </div>
  );
}

const offeredMethods: readonly PaymentMethod[] = ['UPI', 'Card', 'Stripe', 'Cash on Delivery'];

/** A choice saved by an older checkout (e.g. the combined "Razorpay") is dropped so it asks again. */
const normalizeMethod = (method: PaymentMethod | null): PaymentMethod | null =>
  method !== null && offeredMethods.includes(method) ? method : null;

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const navigate = useNavigate();
  const createOrder = useCreateOrder();
  const razorpayPayment = useRazorpayPayment();
  const stripePayment = useStripePayment();
  const paymentOptions = usePaymentOptions();
  const { user } = useAuth();
  const { isChecking, notices } = useFreshCart();
  const rewards = useRewards({ enabled: Boolean(user) });

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(
    getShippingAddress,
  );
  const [chosenMethod, setPaymentMethod] = useState<PaymentMethod | null>(() =>
    normalizeMethod(getPaymentMethod()),
  );
  const isStripeAvailable = paymentOptions.data?.stripe === true;
  // A remembered Stripe choice is dropped if the server can't take Stripe, so it asks again.
  const paymentMethod =
    chosenMethod === 'Stripe' && paymentOptions.data && !isStripeAvailable ? null : chosenMethod;
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>('standard');
  const [isUsingPoints, setIsUsingPoints] = useState(false);
  // The code the customer entered; the quote says whether it applies and what it takes off.
  const [couponCode, setCouponCode] = useState<string | undefined>();
  // Start at the first step that still needs an answer.
  const [step, setStep] = useState<Step>(() =>
    !getShippingAddress()
      ? 'shipping'
      : !normalizeMethod(getPaymentMethod())
        ? 'payment'
        : 'review',
  );

  // Ask for the whole balance; the server caps it to what this order allows and the quote says
  // exactly how many points will be used.
  const quoteInput = {
    orderItems: items.map((item) => ({ product: item.productId, qty: item.quantity })),
    pointsToRedeem: isUsingPoints ? (rewards.data?.pointsBalance ?? 0) : 0,
    deliveryOption,
    ...(couponCode && { couponCode }),
  };
  const quote = useOrderQuote(quoteInput, { enabled: items.length > 0 && !isChecking });
  const isQuoteCurrent = quote.isSuccess && !quote.isFetching;

  // One key per distinct order: retries of the same order reuse it (so a double click or a
  // timed-out request can't create two orders); any change to the order gets a new key.
  const orderSignature = JSON.stringify([
    items.map((item) => [item.productId, item.quantity, item.price]),
    shippingAddress,
    paymentMethod,
    quoteInput.pointsToRedeem,
    deliveryOption,
    couponCode,
  ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- new key whenever the order changes
  const idempotencyKey = useMemo(() => crypto.randomUUID(), [orderSignature]);

  // Once placed, the cart empties; don't let the guards below bounce the user to /cart.
  if (createOrder.isSuccess) {
    return (
      <PaymentInProgress
        orderNumber={createOrder.data._id.slice(-8)}
        isStripe={createOrder.data.paymentMethod === 'Stripe'}
      />
    );
  }
  // Lost a race for the last units: the failed order refetches stock and the cart drops what
  // sold out. Explain that here instead of silently bouncing an emptied cart to /cart.
  const stockConflict = readStockConflict(createOrder.error);
  if (items.length === 0) {
    // Mid-request the cart can empty before the result lands; wait for it rather than redirect.
    if (createOrder.isPending) return null;
    if (!stockConflict) return <Navigate to="/cart" replace />;
    return (
      <div className="container pt-8">
        <StockConflictNotice shortages={stockConflict} isCartEmpty />
      </div>
    );
  }

  // Until the first quote arrives, show the cart's pre-discount numbers (button stays disabled).
  const pricing: OrderPricing = quote.data ?? {
    ...calculateOrderPricing(items),
    expressDeliveryPrice: 0,
    memberSavings: 0,
    memberBenefitsApplied: false,
    pointsMultiplier: 1,
    firstOrderDiscount: 0,
    couponDiscount: 0,
    pointsRedeemed: 0,
    pointsDiscount: 0,
    maxRedeemablePoints: 0,
  };
  const isOnlinePayment = paymentMethod !== 'Cash on Delivery';
  const isReady = shippingAddress !== null && paymentMethod !== null;

  const stateOf = (target: Step): StepState => {
    if (step === target) return 'active';
    if (target === 'shipping') return shippingAddress ? 'done' : 'upcoming';
    if (target === 'payment') return shippingAddress && paymentMethod ? 'done' : 'upcoming';
    return 'upcoming';
  };

  const showOrder = (orderId: string, outcome: CheckoutOutcome) =>
    navigate(`/orders/${orderId}`, { replace: true, state: { checkoutOutcome: outcome } });

  /** Sends the browser to Stripe's page for a just-created order. */
  const payWithStripe = (orderId: string) =>
    stripePayment.mutate(orderId, {
      onError: (error) =>
        showOrder(orderId, {
          kind: 'paymentFailed',
          message: getErrorMessage(error, 'We could not open Stripe.'),
        }),
    });

  /** Opens Razorpay for a just-created order, then shows the order with the result. */
  const payOnline = (orderId: string) => {
    if (paymentMethod === 'Stripe') return payWithStripe(orderId);
    if (!user) return showOrder(orderId, { kind: 'paymentDismissed' });
    razorpayPayment.mutate(
      {
        orderId,
        payer: { name: user.name, email: user.email },
        paymentMethod: paymentMethod ?? undefined,
      },
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
    if (!shippingAddress || !paymentMethod) return;
    createOrder.mutate(
      {
        idempotencyKey,
        input: {
          orderItems: quoteInput.orderItems,
          shippingAddress,
          paymentMethod,
          deliveryOption,
          // Only a code the quote accepted; an order with a rejected one would be refused.
          ...(pricing.couponCode && { couponCode: pricing.couponCode }),
          pointsToRedeem: pricing.pointsRedeemed,
          // The server rejects the order if its total differs from the quote shown here.
          totalPrice: pricing.totalPrice,
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

  const payLabel = isOnlinePayment ? `Pay ${formatCurrency(pricing.totalPrice)}` : 'Place order';

  return (
    <div className="container py-8 sm:py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-display text-ink sm:text-3xl">Checkout</h1>

      {stockConflict ? (
        <StockConflictNotice shortages={stockConflict} isCartEmpty={false} />
      ) : (
        createOrder.isError && (
          <Alert variant="error" className="mb-6">
            {getErrorMessage(createOrder.error, 'Failed to place order. Please try again.')}
          </Alert>
        )
      )}
      {quote.isError && (
        <Alert variant="error" className="mb-6">
          {getErrorMessage(quote.error, 'Could not calculate your total. Please try again.')}
        </Alert>
      )}
      {notices.length > 0 && !stockConflict && (
        <Alert variant="error" className="mb-6">
          <p className="font-semibold">Your cart was updated. Please review before ordering:</p>
          <ul className="mt-1 list-disc pl-5">
            {notices.map((notice) => (
              <li key={notice}>{notice}</li>
            ))}
          </ul>
        </Alert>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px] lg:gap-10">
        <div className="space-y-4">
          <CheckoutStepCard
            number={1}
            title="Shipping address"
            state={stateOf('shipping')}
            onEdit={() => setStep('shipping')}
            summary={
              shippingAddress &&
              `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.postalCode}, ${shippingAddress.country}`
            }
          >
            <ShippingStep
              lastUsed={shippingAddress}
              onContinue={(address) => {
                saveShippingAddress(address);
                setShippingAddress(address);
                setStep('payment');
              }}
            />
          </CheckoutStepCard>

          <CheckoutStepCard
            number={2}
            title="Delivery and payment"
            state={stateOf('payment')}
            onEdit={() => setStep('payment')}
            summary={
              paymentMethod &&
              `${deliveryOption === 'express' ? 'Express' : 'Standard'} delivery · ${
                paymentMethod === 'Cash on Delivery'
                  ? 'Cash on delivery'
                  : paymentMethod === 'Stripe'
                    ? 'Card with Stripe'
                    : paymentMethod === 'UPI'
                      ? 'UPI'
                      : 'Card with Razorpay'
              }`
            }
          >
            <PaymentStep
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              deliveryOption={deliveryOption}
              onDeliveryOptionChange={setDeliveryOption}
              isMember={pricing.memberBenefitsApplied}
              isStripeAvailable={isStripeAvailable}
              onContinue={() => {
                if (!paymentMethod) return;
                savePaymentMethod(paymentMethod);
                setStep('review');
              }}
            />
          </CheckoutStepCard>

          <CheckoutStepCard number={3} title="Review and place order" state={stateOf('review')}>
            <OrderItemsList
              lines={items.map((item) => ({
                key: item.productId,
                name: item.name,
                imageUrl: item.imageUrl,
                quantity: item.quantity,
                price: item.price,
              }))}
            />
          </CheckoutStepCard>
        </div>

        <PriceSummary {...pricing}>
          {quote.data && !pricing.memberBenefitsApplied && (
            <PlusNudge>
              Join Plus: free shipping, free express delivery and 2× points on every order.
            </PlusNudge>
          )}
          <CouponField
            // Re-created when the code changes, so the field starts empty after a removal.
            key={pricing.couponCode ?? 'none'}
            {...(pricing.couponCode && {
              applied: { code: pricing.couponCode, discount: pricing.couponDiscount ?? 0 },
            })}
            {...(quote.data?.couponError && { error: quote.data.couponError })}
            isChecking={Boolean(couponCode) && quote.isFetching}
            onApply={setCouponCode}
            onRemove={() => setCouponCode(undefined)}
            disabled={createOrder.isPending}
          />
          {rewards.data && (
            <PointsRedeemer
              balance={rewards.data.pointsBalance}
              maxRedeemable={quote.data?.maxRedeemablePoints ?? 0}
              isUsingPoints={isUsingPoints}
              onChange={setIsUsingPoints}
              disabled={createOrder.isPending}
            />
          )}
          <Button
            className="w-full"
            isLoading={createOrder.isPending}
            // Never submit prices or quantities the catalogue hasn't just confirmed.
            disabled={!isReady || step !== 'review' || isChecking || !isQuoteCurrent}
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
              : step !== 'review'
                ? 'Complete the steps to continue'
                : isChecking || !isQuoteCurrent
                  ? 'Checking prices and stock…'
                  : payLabel}
          </Button>
          {isReady && step === 'review' && isOnlinePayment && (
            <p className="text-center text-xs text-graphite">
              {paymentMethod === 'Stripe'
                ? 'You will be taken to Stripe to securely complete your payment.'
                : `Razorpay opens next with ${paymentMethod === 'UPI' ? 'UPI' : 'card'} payment.`}
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
  );
}
