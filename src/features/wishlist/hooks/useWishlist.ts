import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Product } from '@/features/products';
import * as wishlistApi from '../api/wishlistApi';

export const wishlistKeys = { all: ['wishlist'] as const };

export function useWishlist({ enabled }: { enabled: boolean }) {
  return useQuery({
    queryKey: wishlistKeys.all,
    queryFn: ({ signal }) => wishlistApi.getWishlist(signal),
    enabled,
  });
}

type ToggleInput = { product: Product; isSaved: boolean };

/**
 * Saves or removes a product. The heart flips immediately (optimistic) and goes back if the
 * server refuses; the server's returned list replaces the cache either way.
 */
export function useToggleWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ product, isSaved }: ToggleInput) =>
      isSaved
        ? wishlistApi.removeFromWishlist(product._id)
        : wishlistApi.addToWishlist(product._id),
    onMutate: async ({ product, isSaved }) => {
      await queryClient.cancelQueries({ queryKey: wishlistKeys.all });
      const previous = queryClient.getQueryData<Product[]>(wishlistKeys.all);
      queryClient.setQueryData<Product[]>(wishlistKeys.all, (current = []) =>
        isSaved
          ? current.filter((item) => item._id !== product._id)
          : [product, ...current.filter((item) => item._id !== product._id)],
      );
      return { previous };
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(wishlistKeys.all, context?.previous);
    },
    onSuccess: (wishlist) => queryClient.setQueryData(wishlistKeys.all, wishlist),
  });
}
