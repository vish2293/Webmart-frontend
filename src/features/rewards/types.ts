export type PointsTransactionType =
  'earn' | 'earn_revoke' | 'redeem' | 'redeem_return' | 'revive_redeem' | 'revive_return';

/** GET /rewards/me */
export type RewardsSummary = {
  pointsBalance: number;
  isFirstOrderEligible: boolean;
  history: { type: PointsTransactionType; points: number; order: string; createdAt: string }[];
};
