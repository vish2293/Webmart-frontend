import { useQuery } from '@tanstack/react-query';
import * as rewardsApi from '../api/rewardsApi';

/** Invalidate `rewardKeys.all` after anything that can move points (orders, cancels, refunds). */
export const rewardKeys = {
  all: ['rewards'] as const,
  me: () => [...rewardKeys.all, 'me'] as const,
};

export function useRewards({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: rewardKeys.me(),
    queryFn: ({ signal }) => rewardsApi.getMyRewards(signal),
    enabled,
  });
}
