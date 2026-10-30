import { httpClient } from '@/lib/httpClient';

export type CouponType = 'percent' | 'fixed';

/** Admin view of a coupon (GET /coupons). */
export type AdminCoupon = {
  _id: string;
  code: string;
  description?: string;
  type: CouponType;
  /** Percent (1-100) or rupees off, depending on `type`. */
  value: number;
  maxDiscount?: number;
  minOrderValue: number;
  startsAt?: string;
  expiresAt?: string;
  usageLimit?: number;
  perUserLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
};

export type CouponInput = {
  code: string;
  description?: string;
  type: CouponType;
  value: number;
  maxDiscount?: number;
  minOrderValue: number;
  startsAt?: string;
  expiresAt?: string;
  usageLimit?: number;
  perUserLimit: number;
  isActive: boolean;
};

/** Fields an existing coupon can change; `null` clears an optional one. */
export type CouponUpdate = Partial<{
  description: string;
  value: number;
  maxDiscount: number | null;
  minOrderValue: number;
  startsAt: string | null;
  expiresAt: string | null;
  usageLimit: number | null;
  perUserLimit: number;
  isActive: boolean;
}>;

const couponPath = (couponId: string) => `/coupons/${encodeURIComponent(couponId)}`;

export const getCoupons = (signal?: AbortSignal) =>
  httpClient.get<AdminCoupon[]>('/coupons', signal);

export const createCoupon = (input: CouponInput) => httpClient.post<AdminCoupon>('/coupons', input);

export const updateCoupon = ({ couponId, changes }: { couponId: string; changes: CouponUpdate }) =>
  httpClient.put<AdminCoupon>(couponPath(couponId), changes);

export const deleteCoupon = (couponId: string) =>
  httpClient.delete<{ message: string }>(couponPath(couponId));
