import { ApiError } from '@/lib/httpClient';

/** One product the order couldn't be filled for, as reported by the server. */
export type StockShortage = {
  productId: string;
  name: string;
  requested: number;
  available: number;
};

const isStockShortage = (value: unknown): value is StockShortage => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.productId === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.requested === 'number' &&
    typeof candidate.available === 'number'
  );
};

/**
 * The shortages behind an INSUFFICIENT_STOCK order failure — usually another customer's order
 * took the last units first. `null` for any other error.
 */
export function readStockConflict(error: unknown): StockShortage[] | null {
  if (!(error instanceof ApiError) || error.code !== 'INSUFFICIENT_STOCK') return null;
  const details = error.details;
  const items =
    details && typeof details === 'object' && 'items' in details && Array.isArray(details.items)
      ? details.items.filter(isStockShortage)
      : [];
  // An older server without details still gets the dedicated message, just without the list.
  return items;
}
