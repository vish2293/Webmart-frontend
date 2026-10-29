import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './httpClient';

const isClientError = (error: unknown) =>
  error instanceof ApiError && error.status >= 400 && error.status < 500;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      // 4xx won't succeed on retry.
      retry: (failureCount, error) => !isClientError(error) && failureCount < 2,
    },
  },
});
