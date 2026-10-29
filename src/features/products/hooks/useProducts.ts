import {
  keepPreviousData,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { ApiError } from '@/lib/httpClient';
import * as productsApi from '../api/productsApi';
import type { Product, ProductFilters, ProductInput } from '../types';

export const productKeys = {
  all: ['products'] as const,
  list: (filters: ProductFilters) => [...productKeys.all, 'list', filters] as const,
  detail: (productId: string) => [...productKeys.all, 'detail', productId] as const,
};

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: ({ signal }) => productsApi.getProducts(filters, signal),
    placeholderData: keepPreviousData,
  });
}

export function useProduct(productId: string) {
  return useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: ({ signal }) => productsApi.getProduct(productId, signal),
  });
}

/** Distinct categories, derived from the unfiltered (cached) product list. */
export function useProductCategories() {
  const { data } = useProducts();
  return [...new Set(data?.map((product) => product.category))].sort();
}

/**
 * Always-fresh data for specific products (e.g. what's in the cart). `null` means the
 * product was deleted. `isFetching` is true until every product has been checked.
 */
export function useLatestProducts(productIds: string[]) {
  return useQueries({
    queries: productIds.map((productId) => ({
      queryKey: productKeys.detail(productId),
      queryFn: ({ signal }: { signal: AbortSignal }) => productsApi.getProduct(productId, signal),
      staleTime: 0,
    })),
    combine: (results) => ({
      isFetching: results.some((result) => result.isFetching),
      byId: Object.fromEntries(
        productIds.flatMap<[string, Product | null]>((productId, index) => {
          const result = results[index];
          if (result?.data) return [[productId, result.data]];
          const isGone = result?.error instanceof ApiError && result.error.status === 404;
          return isGone ? [[productId, null]] : [];
        }),
      ) as Record<string, Product | null>,
    }),
  });
}

export function useSaveProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ product, input }: { product?: Product; input: ProductInput }) =>
      product
        ? productsApi.updateProduct(product._id, { ...input, updatedAt: product.updatedAt })
        : productsApi.createProduct(input),
    // Also on error: a PRODUCT_MODIFIED conflict means the list is stale.
    onSettled: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productsApi.deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}
