import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as reviewsApi from '../api/reviewsApi';

export const reviewKeys = {
  all: ['reviews'] as const,
  list: (productId: string, page: number) => [...reviewKeys.all, 'list', productId, page] as const,
  mine: (productId: string) => [...reviewKeys.all, 'mine', productId] as const,
};

export function useReviews(productId: string, page: number) {
  return useQuery({
    queryKey: reviewKeys.list(productId, page),
    queryFn: ({ signal }) => reviewsApi.getReviews(productId, page, signal),
    placeholderData: keepPreviousData,
  });
}

export function useMyReview(productId: string, { enabled }: { enabled: boolean }) {
  return useQuery({
    queryKey: reviewKeys.mine(productId),
    queryFn: ({ signal }) => reviewsApi.getMyReview(productId, signal),
    enabled,
  });
}

/** A review changes the product's average and count, so the product queries refresh too. */
function useRefreshAfterReview() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: reviewKeys.all }),
      queryClient.invalidateQueries({ queryKey: ['products'] }),
    ]);
}

export function useSaveReview() {
  const refresh = useRefreshAfterReview();
  return useMutation({ mutationFn: reviewsApi.saveReview, onSuccess: refresh });
}

export function useDeleteReview() {
  const refresh = useRefreshAfterReview();
  return useMutation({ mutationFn: reviewsApi.deleteReview, onSuccess: refresh });
}
