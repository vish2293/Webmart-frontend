import { X } from 'lucide-react';
import { emptyListingFilters, priceRanges, type ListingFilters } from '../utils/parseFilters';

type ActiveFiltersProps = {
  filters: ListingFilters;
  onChange: (filters: ListingFilters) => void;
};

/** Removable chips for every applied filter, plus "Clear all". */
export function ActiveFilters({ filters, onChange }: ActiveFiltersProps) {
  const chips = [
    filters.keyword && {
      key: 'keyword',
      label: `“${filters.keyword}”`,
      clear: { ...filters, keyword: '' },
    },
    filters.category && {
      key: 'category',
      label: filters.category,
      clear: { ...filters, category: '' },
    },
    filters.price && {
      key: 'price',
      label: priceRanges.find((range) => range.id === filters.price)?.label ?? '',
      clear: { ...filters, price: '' as const },
    },
    filters.inStockOnly && {
      key: 'stock',
      label: 'In stock',
      clear: { ...filters, inStockOnly: false },
    },
  ].filter((chip) => chip !== false && chip !== '');

  if (chips.length === 0) return null;

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onChange(chip.clear)}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[13px] font-medium text-ink transition-colors hover:border-ink"
        >
          {chip.label}
          <X size={13} aria-hidden />
          <span className="sr-only">Remove filter</span>
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...emptyListingFilters, sort: filters.sort })}
        className="ml-1 inline-flex h-8 items-center gap-1 px-1 text-[13px] font-semibold text-ink decoration-brand-400 decoration-2 underline-offset-4 hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
