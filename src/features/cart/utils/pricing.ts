import type { CartItem, OrderPricing } from '../types';

// ponytail: pricing rules live client-side because the server trusts submitted prices.
// The server must recalculate these before this goes live (see server TODO).
export const pricingRules = {
  taxRate: 0.08,
  flatShippingPrice: 10,
  freeShippingThreshold: 100,
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
