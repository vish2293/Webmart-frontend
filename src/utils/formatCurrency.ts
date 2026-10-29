const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
});

const inrWholeFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export const formatCurrency = (amount: number | undefined | null): string =>
  inrFormatter.format(amount ?? 0);

/** Rounded, for headline/marketing figures (₹659 rather than ₹659.00). */
export const formatCurrencyWhole = (amount: number | undefined | null): string =>
  inrWholeFormatter.format(amount ?? 0);
