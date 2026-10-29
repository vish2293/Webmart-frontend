import { httpClient } from '@/lib/httpClient';
import type { CreateOrderInput, Order, RazorpayCheckoutSession } from '../types';
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

/** Admin only: confirms an offline (cash on delivery) payment. */
export const markOrderPaid = (orderId: string) =>
  httpClient.put<Order>(`${orderPath(orderId)}/pay`);

/** Admin only. */
export const deliverOrder = (orderId: string) =>
  httpClient.put<Order>(`${orderPath(orderId)}/deliver`);
