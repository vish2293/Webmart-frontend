export type PointsTransactionType =
  | 'earn'
  | 'earn_revoke'
  | 'redeem'
  | 'redeem_return'
  | 'revive_redeem'
  | 'revive_return'
  | 'membership_bonus'
  | 'membership_bonus_revoke';

/** GET /rewards/me */
export type RewardsSummary = {
  pointsBalance: number;
  isFirstOrderEligible: boolean;
  history: {
    type: PointsTransactionType;
    points: number;
    /** The membership id for membership_* entries. */
    order: string;
    createdAt: string;
  }[];
};
