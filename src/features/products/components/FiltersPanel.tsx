import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { priceRanges, type ListingFilters } from '../utils/parseFilters';

type FiltersPanelProps = {
  filters: ListingFilters;
  categories: string[];
  onChange: (filters: ListingFilters) => void;
};

/** Collapsible group built on native <details>, so it is keyboard-accessible for free. */
function FilterGroup({
  title,
  activeCount,
  children,
}: {
  title: string;
  activeCount: number;
  children: ReactNode;
}) {
  // Open on desktop; on phones the panel sits above the grid, so start collapsed.
  const [isInitiallyOpen] = useState(() => window.matchMedia('(min-width: 1024px)').matches);
  return (
    <details
      open={isInitiallyOpen}
      className="group/filter border-t border-line py-4 first-of-type:border-t-0 first-of-type:pt-0"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          {title}
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-400 px-1.5 text-[11px] font-bold">
              {activeCount}
              <span className="sr-only"> selected</span>
            </span>
          )}
        </span>
        <ChevronDown
          size={16}
          className="text-graphite transition-transform group-open/filter:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="mt-3 space-y-1">{children}</div>
    </details>
  );
}

function Option({
  type,
  name,
  label,
  checked,
  onChange,
}: {
  type: 'radio' | 'checkbox';
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1.5 text-sm text-ink hover:bg-mist">
      <input
        type={type}
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-ink"
      />
      {label}
    </label>
  );
}

export function FiltersPanel({ filters, categories, onChange }: FiltersPanelProps) {
  return (
    <aside aria-label="Filters" className="rounded-xl border border-line bg-white p-5">
      <h2 className="mb-4 text-lg font-bold tracking-display text-ink">Filters</h2>

      <FilterGroup title="Category" activeCount={filters.category ? 1 : 0}>
        <Option
          type="radio"
          name="category"
          label="All categories"
          checked={!filters.category}
          onChange={() => onChange({ ...filters, category: '' })}
        />
        {categories.map((category) => (
          <Option
            key={category}
            type="radio"
            name="category"
            label={category}
            checked={filters.category === category}
            onChange={() => onChange({ ...filters, category })}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Price" activeCount={filters.price ? 1 : 0}>
        <Option
          type="radio"
          name="price"
          label="Any price"
          checked={!filters.price}
          onChange={() => onChange({ ...filters, price: '' })}
        />
        {priceRanges.map((range) => (
          <Option
            key={range.id}
            type="radio"
            name="price"
            label={range.label}
            checked={filters.price === range.id}
            onChange={() => onChange({ ...filters, price: range.id })}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Availability" activeCount={filters.inStockOnly ? 1 : 0}>
        <Option
          type="checkbox"
          name="stock"
          label="In stock only"
          checked={filters.inStockOnly}
          onChange={() => onChange({ ...filters, inStockOnly: !filters.inStockOnly })}
        />
      </FilterGroup>
    </aside>
  );
}
