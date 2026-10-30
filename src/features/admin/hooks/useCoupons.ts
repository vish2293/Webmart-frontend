import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as couponsApi from '../api/couponsApi';

const couponKeys = { all: ['coupons'] as const };

export function useCoupons() {
  return useQuery({
    queryKey: couponKeys.all,
    queryFn: ({ signal }) => couponsApi.getCoupons(signal),
  });
}

function useCouponMutation<TInput, TResult>(mutationFn: (input: TInput) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    // Also on error: a 409 means the list was out of date.
    onSettled: () => queryClient.invalidateQueries({ queryKey: couponKeys.all }),
  });
}

export const useCreateCoupon = () => useCouponMutation(couponsApi.createCoupon);
export const useUpdateCoupon = () => useCouponMutation(couponsApi.updateCoupon);
export const useDeleteCoupon = () => useCouponMutation(couponsApi.deleteCoupon);
