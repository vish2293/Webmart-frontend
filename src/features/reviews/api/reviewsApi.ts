import { httpClient } from '@/lib/httpClient';
import type { MyReviewState, ReviewInput, ReviewList } from '../types';

const reviewsPath = (productId: string) => `/products/${encodeURIComponent(productId)}/reviews`;

export const getReviews = (productId: string, page: number, signal?: AbortSignal) =>
  httpClient.get<ReviewList>(`${reviewsPath(productId)}?pageNumber=${page}&limit=5`, signal);

export const getMyReview = (productId: string, signal?: AbortSignal) =>
  httpClient.get<MyReviewState>(`${reviewsPath(productId)}/mine`, signal);

/** Creates the customer's review, or replaces the one they already wrote. */
export const saveReview = ({ productId, input }: { productId: string; input: ReviewInput }) =>
  httpClient.put<MyReviewState>(`${reviewsPath(productId)}/mine`, input);

export const deleteReview = ({ productId, reviewId }: { productId: string; reviewId: string }) =>
  httpClient.delete<{ message: string }>(
    `${reviewsPath(productId)}/${encodeURIComponent(reviewId)}`,
  );
