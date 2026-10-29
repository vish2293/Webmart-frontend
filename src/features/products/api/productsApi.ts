import { httpClient } from '@/lib/httpClient';
import type { Product, ProductFilters, ProductInput } from '../types';

type ProductListResponse = { products: Product[]; page: number; pages: number };

export async function getProducts(filters: ProductFilters = {}, signal?: AbortSignal) {
  const params = new URLSearchParams();
  if (filters.keyword) params.set('keyword', filters.keyword);
  if (filters.category) params.set('category', filters.category);
  if (filters.sort && filters.sort !== 'newest') params.set('sortBy', filters.sort);

  const query = params.toString();
  const response = await httpClient.get<ProductListResponse>(
    `/products${query ? `?${query}` : ''}`,
    signal,
  );
  return response.products;
}

export const getProduct = (productId: string, signal?: AbortSignal) =>
  httpClient.get<Product>(`/products/${encodeURIComponent(productId)}`, signal);

export const createProduct = (input: ProductInput) =>
  httpClient.post<Product>('/products/admin', input);

/** `updatedAt` must be the version the form was loaded from; the server rejects stale saves. */
export const updateProduct = (productId: string, input: ProductInput & { updatedAt: string }) =>
  httpClient.put<Product>(`/products/admin/${encodeURIComponent(productId)}`, input);

export const deleteProduct = (productId: string) =>
  httpClient.delete<{ message: string }>(`/products/admin/${encodeURIComponent(productId)}`);
