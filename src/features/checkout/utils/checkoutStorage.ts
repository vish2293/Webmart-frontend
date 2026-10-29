import { paymentMethods, type PaymentMethod, type ShippingAddress } from '@/features/orders';
import { readJson, removeKey, writeJson } from '@/lib/storage';

const shippingKey = 'shippingAddress';
const paymentKey = 'paymentMethod';

const addressFields = ['address', 'city', 'postalCode', 'country'] as const;

const isShippingAddress = (value: unknown): value is ShippingAddress =>
  typeof value === 'object' &&
  value !== null &&
  addressFields.every((field) => typeof (value as Record<string, unknown>)[field] === 'string');

const isPaymentMethod = (value: unknown): value is PaymentMethod =>
  typeof value === 'string' && (paymentMethods as readonly string[]).includes(value);

export function getShippingAddress(): ShippingAddress | null {
  const stored = readJson<unknown>(shippingKey, null);
  return isShippingAddress(stored) ? stored : null;
}

export const saveShippingAddress = (address: ShippingAddress) => writeJson(shippingKey, address);

export function getPaymentMethod(): PaymentMethod | null {
  const stored = readJson<unknown>(paymentKey, null);
  return isPaymentMethod(stored) ? stored : null;
}

export const savePaymentMethod = (method: PaymentMethod) => writeJson(paymentKey, method);

export function clearCheckout() {
  removeKey(shippingKey);
  removeKey(paymentKey);
}
