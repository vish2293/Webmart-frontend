import { httpClient } from '@/lib/httpClient';
import type { RazorpayPaymentResponse } from '@/features/orders/api/razorpayCheckout';
import type {
  AdminMembership,
  MembershipCheckoutSession,
  MembershipPlan,
  MembershipPlanId,
  MembershipSummary,
} from '../types';

const membershipPath = (id: string) => `/memberships/${encodeURIComponent(id)}`;

export const getPlans = (signal?: AbortSignal) =>
  httpClient.get<MembershipPlan[]>('/memberships/plans', signal);

export const getMyMembership = (signal?: AbortSignal) =>
  httpClient.get<MembershipSummary>('/memberships/me', signal);

export const startCheckout = (plan: MembershipPlanId) =>
  httpClient.post<MembershipCheckoutSession>('/memberships/checkout', { plan });

export const verifyPayment = (id: string, response: RazorpayPaymentResponse) =>
  httpClient.post<MembershipSummary>(`${membershipPath(id)}/verify`, response);

/** Full refund while the window is open and no order has used the benefits. */
export const cancelMembership = (id: string) =>
  httpClient.post<MembershipSummary>(`${membershipPath(id)}/cancel`);

/** Admin only. */
export const getAllMemberships = (signal?: AbortSignal) =>
  httpClient.get<AdminMembership[]>('/memberships', signal);

/** Admin only: refunds any active membership, ignoring the customer's window. */
export const refundMembership = (id: string) =>
  httpClient.post<AdminMembership>(`${membershipPath(id)}/refund`);

/** Admin only. */
export const retryMembershipRefund = (id: string) =>
  httpClient.post<AdminMembership>(`${membershipPath(id)}/refund/retry`);
