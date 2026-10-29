import type { CartItem, OrderPricing } from '../types';

// ponytail: pricing rules live client-side because the server trusts submitted prices.
// Keep in sync with server/src/modules/orders/order-pricing.ts; the server's quote is what's charged.
export const pricingRules = {
  taxRate: 0.08,
  flatShippingPrice: 10,
  freeShippingThreshold: 100,
  expressDeliveryPrice: 49,
  standardDeliveryDays: 7,
  expressDeliveryDays: 2,
} as const;

const roundMoney = (amount: number) => Math.round(amount * 100) / 100;

export function calculateOrderPricing(items: CartItem[]): OrderPricing {
  const itemsPrice = roundMoney(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const shippingPrice =
    itemsPrice === 0 || itemsPrice > pricingRules.freeShippingThreshold
      ? 0
      : pricingRules.flatShippingPrice;
  const taxPrice = roundMoney(itemsPrice * pricingRules.taxRate);

  return {
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice: roundMoney(itemsPrice + shippingPrice + taxPrice),
  };
}
