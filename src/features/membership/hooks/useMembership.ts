import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { openRazorpayCheckout } from '@/features/orders';
import { rewardKeys } from '@/features/rewards';
import { ApiError } from '@/lib/httpClient';
import * as membershipApi from '../api/membershipApi';
import type { MembershipPlanId } from '../types';

export const membershipKeys = {
  all: ['membership'] as const,
  plans: () => [...membershipKeys.all, 'plans'] as const,
  me: () => [...membershipKeys.all, 'me'] as const,
  admin: () => [...membershipKeys.all, 'admin'] as const,
};

/** Membership changes shipping prices, points and the quote, so refresh all of them. */
function useRefreshAfterChange() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: membershipKeys.all }),
      queryClient.invalidateQueries({ queryKey: rewardKeys.all }),
      queryClient.invalidateQueries({ queryKey: ['orders'] }),
    ]);
}

export function usePlans() {
  return useQuery({
    queryKey: membershipKeys.plans(),
    queryFn: ({ signal }) => membershipApi.getPlans(signal),
    staleTime: 10 * 60_000,
  });
}

export function useMembership({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: membershipKeys.me(),
    queryFn: ({ signal }) => membershipApi.getMyMembership(signal),
    enabled,
  });
}

/** Create gateway order → Razorpay window → server verification. `null` if the window is closed. */
export function useBuyMembership(payer: { name: string; email: string } | null) {
  const refresh = useRefreshAfterChange();
  return useMutation({
    mutationFn: async (plan: MembershipPlanId) => {
      if (!payer) throw new Error('Please log in to join Plus.');
      const session = await membershipApi.startCheckout(plan);
      const response = await openRazorpayCheckout({
        key: session.keyId,
        order_id: session.razorpayOrderId,
        amount: session.amount,
        currency: session.currency,
        name: 'Webvoltz Store',
        description: session.label,
        prefill: payer,
        theme: { color: '#FFC107' },
      });
      if (!response) return null;

      try {
        return await membershipApi.verifyPayment(session.membershipId, response);
      } catch (error) {
        if (error instanceof ApiError && error.status === 409) throw error;
        // The charge went through; the server's webhook still activates the membership.
        throw new Error(
          'We received your payment but could not confirm it yet. Your Plus membership will start automatically in a few minutes.',
        );
      }
    },
    onSettled: refresh,
  });
}

export function useCancelMembership() {
  const refresh = useRefreshAfterChange();
  return useMutation({ mutationFn: membershipApi.cancelMembership, onSettled: refresh });
}

export function useAllMemberships() {
  return useQuery({
    queryKey: membershipKeys.admin(),
    queryFn: ({ signal }) => membershipApi.getAllMemberships(signal),
  });
}

export function useRefundMembership() {
  const refresh = useRefreshAfterChange();
  return useMutation({ mutationFn: membershipApi.refundMembership, onSettled: refresh });
}

export function useRetryMembershipRefund() {
  const refresh = useRefreshAfterChange();
  return useMutation({ mutationFn: membershipApi.retryMembershipRefund, onSettled: refresh });
}
