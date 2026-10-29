export type ShippingAddress = {
  address: string;
  city: string;
  postalCode: string;
  country: string;
};

export const paymentMethods = ['UPI', 'Card', 'Cash on Delivery'] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

export const deliveryOptions = ['standard', 'express'] as const;
export type DeliveryOption = (typeof deliveryOptions)[number];

export type OrderItem = {
  product: string;
  name: string;
  qty: number;
  image: string;
  price: number;
};

export type Order = {
  _id: string;
  /** Populated with name/email on admin list endpoints. */
  user?: { _id: string; name: string; email?: string } | string;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  itemsPrice?: number;
  firstOrderDiscount?: number;
  pointsRedeemed?: number;
  pointsDiscount?: number;
  /** Points credited once the order was paid and delivered. */
  pointsEarned?: number;
  taxPrice: number;
  shippingPrice: number;
  /** Orders placed before express delivery existed have none of these fields. */
  deliveryOption?: DeliveryOption;
  expressDeliveryPrice?: number;
  /** Plus benefits were applied; `memberSavings` is the shipping/express fees waived. */
  memberBenefitsApplied?: boolean;
  memberSavings?: number;
  pointsMultiplier?: number;
  estimatedDeliveryDate?: string;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  paymentResult?: { id?: string; status?: string; method?: string };
  isShipped?: boolean;
  shippedAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  /** Cancelled orders have their stock, points and first-order discount returned. */
  isCancelled?: boolean;
  cancelledAt?: string;
  cancelReason?: CancelReason;
  /** Set when an admin refunded a shipped order. */
  refundedAt?: string;
  refunds?: RefundRecord[];
  createdAt: string;
};

export type CancelReason = 'payment_expired' | 'customer' | 'admin';

export type RefundStatus = 'pending' | 'processed' | 'failed' | 'manual_required';
export type RefundReason =
  'customer_cancel' | 'admin_cancel' | 'admin_refund' | 'late_payment' | 'duplicate_payment';

/** `paymentId` is 'cod' for cash refunds settled outside the app. */
export type RefundRecord = {
  paymentId: string;
  amount: number;
  status: RefundStatus;
  razorpayRefundId?: string;
  reason: RefundReason;
  requestedAt: string;
  processedAt?: string;
  failureReason?: string;
};

/** POST /orders/quote — the exact amounts the order will be charged. */
export type OrderPricing = {
  itemsPrice: number;
  shippingPrice: number;
  expressDeliveryPrice: number;
  memberSavings: number;
  memberBenefitsApplied: boolean;
  pointsMultiplier: number;
  firstOrderDiscount: number;
  pointsRedeemed: number;
  pointsDiscount: number;
  /** Most points usable on this order with the customer's balance. */
  maxRedeemablePoints: number;
  taxPrice: number;
  totalPrice: number;
};

export type QuoteOrderInput = {
  orderItems: { product: string; qty: number }[];
  pointsToRedeem: number;
  deliveryOption: DeliveryOption;
};

/** Returned by POST /orders/:id/razorpay; `amount` is in paise. */
export type RazorpayCheckoutSession = {
  keyId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  /** After this the order is cancelled; the checkout window must close before it. */
  expiresAt: string;
};

/** Prices aren't trusted by the server: `totalPrice` only has to match its own quote. */
export type CreateOrderInput = {
  orderItems: { product: string; qty: number }[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  deliveryOption: DeliveryOption;
  pointsToRedeem: number;
  totalPrice: number;
};

/** Passed from checkout to the order page (as router state) to explain what just happened. */
export type CheckoutOutcome =
  | { kind: 'paid' }
  | { kind: 'cashOnDelivery' }
  | { kind: 'paymentDismissed' }
  | { kind: 'paymentFailed'; message: string };
