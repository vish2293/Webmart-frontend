export type ShippingAddress = {
  address: string;
  city: string;
  postalCode: string;
  country: string;
};

export const paymentMethods = ['UPI', 'Card', 'Cash on Delivery'] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

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
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  /** Unpaid online orders are cancelled after the payment window; stock is released. */
  isCancelled?: boolean;
  cancelledAt?: string;
  createdAt: string;
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

export type CreateOrderInput = {
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
};

/** Passed from checkout to the order page (as router state) to explain what just happened. */
export type CheckoutOutcome =
  | { kind: 'paid' }
  | { kind: 'cashOnDelivery' }
  | { kind: 'paymentDismissed' }
  | { kind: 'paymentFailed'; message: string };
