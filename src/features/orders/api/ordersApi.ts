import { httpClient } from '@/lib/httpClient';
import type {
  CreateOrderInput,
  Order,
  OrderPricing,
  QuoteOrderInput,
  RazorpayCheckoutSession,
  RefundRecord,
} from '../types';
import type { RazorpayPaymentResponse } from './razorpayCheckout';

const orderPath = (orderId: string) => `/orders/${encodeURIComponent(orderId)}`;

/**
 * `idempotencyKey` identifies one checkout attempt: retrying with the same key (double click,
 * timeout) returns the original order instead of creating a second one.
 */
export const createOrder = ({
  input,
  idempotencyKey,
}: {
  input: CreateOrderInput;
  idempotencyKey: string;
}) => httpClient.post<Order>('/orders', input, { 'Idempotency-Key': idempotencyKey });

/** Server-computed totals, including the first-order discount and points. */
export const quoteOrder = (input: QuoteOrderInput) =>
  httpClient.post<OrderPricing>('/orders/quote', input);

/** Customer (own order) or admin, before shipping. Paid orders are refunded automatically. */
export const cancelOrder = (orderId: string) =>
  httpClient.post<Order>(`${orderPath(orderId)}/cancel`);

/** Admin only. */
export const shipOrder = (orderId: string) => httpClient.put<Order>(`${orderPath(orderId)}/ship`);

/** Admin only. Full refund; before shipping it also cancels the order. */
export const refundOrder = (orderId: string) =>
  httpClient.post<Order>(`${orderPath(orderId)}/refund`);

/** Admin only. */
export const retryRefund = ({ orderId, paymentId }: { orderId: string; paymentId: string }) =>
  httpClient.post<RefundRecord>(
    `${orderPath(orderId)}/refunds/${encodeURIComponent(paymentId)}/retry`,
  );

export const getOrder = (orderId: string, signal?: AbortSignal) =>
  httpClient.get<Order>(orderPath(orderId), signal);

export const getMyOrders = (signal?: AbortSignal) =>
  httpClient.get<Order[]>('/orders/myorders', signal);

/** Admin only. */
export const getAllOrders = (signal?: AbortSignal) => httpClient.get<Order[]>('/orders', signal);

/** Creates (or reuses) the Razorpay order for this order's server-calculated total. */
export const startRazorpayPayment = (orderId: string) =>
  httpClient.post<RazorpayCheckoutSession>(`${orderPath(orderId)}/razorpay`);

export const verifyRazorpayPayment = (orderId: string, response: RazorpayPaymentResponse) =>
  httpClient.post<Order>(`${orderPath(orderId)}/razorpay/verify`, response);

/** Owner only: gives up on paying online and pays cash on delivery instead. */
export const switchToCashOnDelivery = (orderId: string) =>
  httpClient.post<Order>(`${orderPath(orderId)}/cash-on-delivery`);

/** Admin only: confirms an offline (cash on delivery) payment. */
export const markOrderPaid = (orderId: string) =>
  httpClient.put<Order>(`${orderPath(orderId)}/pay`);

/** Admin only. */
export const deliverOrder = (orderId: string) =>
  httpClient.put<Order>(`${orderPath(orderId)}/deliver`);
