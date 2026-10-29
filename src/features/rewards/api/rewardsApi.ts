import { httpClient } from '@/lib/httpClient';
import type { RewardsSummary } from '../types';

export const getMyRewards = (signal?: AbortSignal) =>
  httpClient.get<RewardsSummary>('/rewards/me', signal);
