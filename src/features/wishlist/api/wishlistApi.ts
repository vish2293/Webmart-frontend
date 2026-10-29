import { httpClient } from '@/lib/httpClient';
import type { Product } from '@/features/products';

const itemPath = (productId: string) => `/wishlist/${encodeURIComponent(productId)}`;

// Every call returns the whole updated wishlist, newest first.
export const getWishlist = (signal?: AbortSignal) => httpClient.get<Product[]>('/wishlist', signal);

export const addToWishlist = (productId: string) => httpClient.put<Product[]>(itemPath(productId));

export const removeFromWishlist = (productId: string) =>
  httpClient.delete<Product[]>(itemPath(productId));
