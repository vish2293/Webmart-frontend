// Must match server/src/modules/memberships/memberships.config.ts and the express fee in
// server/src/modules/orders/order-pricing.ts. The plan list itself comes from the API.
export const membershipRules = {
  welcomeBonusPoints: 100,
  pointsMultiplier: 2,
  refundWindowDays: 7,
  renewalWindowDays: 7,
} as const;

export const memberBenefits = [
  'Free shipping on every order, whatever the size',
  'Free express delivery (1–2 days) instead of the usual extra charge',
  `${membershipRules.pointsMultiplier}× reward points on every order`,
  `${membershipRules.welcomeBonusPoints} welcome points when you join`,
] as const;
