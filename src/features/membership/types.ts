export type MembershipPlanId = 'monthly' | 'yearly';

/** GET /memberships/plans */
export type MembershipPlan = {
  id: MembershipPlanId;
  label: string;
  price: number;
  durationDays: number;
};

/** GET /memberships/me */
export type MembershipSummary = {
  isMember: boolean;
  endsAt?: string;
  daysLeft: number;
  /** False while a long-running membership is active; renewal opens near the end. */
  canBuy: boolean;
  current: {
    id: string;
    plan: MembershipPlanId;
    label: string;
    startsAt?: string;
    endsAt?: string;
    canRefund: boolean;
    refundDeadline?: string;
  } | null;
  savings: { amount: number; orders: number };
};

export type MembershipRefundStatus = 'pending' | 'processed' | 'failed';

/** Admin list row (GET /memberships). */
export type AdminMembership = {
  _id: string;
  user?: { _id: string; name: string; email: string } | null;
  plan: MembershipPlanId;
  status: 'pending' | 'active' | 'expired' | 'refunded';
  pricePaid: number;
  paidAt?: string;
  startsAt?: string;
  endsAt?: string;
  benefitOrders: number;
  refund?: {
    status: MembershipRefundStatus;
    amount: number;
    failureReason?: string;
  };
  createdAt: string;
};

/** POST /memberships/checkout; `amount` is in paise. */
export type MembershipCheckoutSession = {
  membershipId: string;
  keyId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  label: string;
};
