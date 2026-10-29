import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { useProductSuggestions } from '@/features/products';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { formatCurrencyWhole } from '@/utils/formatCurrency';

const minQueryLength = 2;

/** Search box with live product suggestions (an ARIA combobox: arrows, Enter and Esc work). */
export function HeaderSearch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlKeyword = searchParams.get('q') ?? '';
  const inputId = useId();
  const listId = useId();
  const containerRef = useRef<HTMLFormElement>(null);

  const [value, setValue] = useState(urlKeyword);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Keep the box in step with the page's search (back button, clicking a "did you mean").
  useEffect(() => setValue(urlKeyword), [urlKeyword]);

  const trimmed = value.trim();
  const debounced = useDebouncedValue(trimmed, 250);
  const suggestions = useProductSuggestions(debounced, {
    enabled: isOpen && debounced.length >= minQueryLength,
  });
  const items = trimmed === debounced ? (suggestions.data?.suggestions ?? []) : [];
  const didYouMean = trimmed === debounced ? suggestions.data?.didYouMean : undefined;
  // Rows: each suggested product, then the "search for…" row, then a spelling correction.
  const searchRow = items.length;
  const correctionRow = didYouMean ? items.length + 1 : -1;
  const showPanel = isOpen && trimmed.length >= minQueryLength;

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const goToSearch = (keyword: string) => {
    setIsOpen(false);
    const next = keyword.trim();
    navigate(next ? `/products?q=${encodeURIComponent(next)}` : '/products');
  };

  const choose = (index: number) => {
    const product = items[index];
    if (product) {
      setIsOpen(false);
      navigate(`/products/${product._id}`);
    } else if (index === correctionRow && didYouMean) {
      goToSearch(didYouMean);
    } else {
      goToSearch(trimmed);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Enter on a highlighted suggestion opens it; otherwise it's a plain search.
    if (activeIndex >= 0 && showPanel) choose(activeIndex);
    else goToSearch(trimmed);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const rowCount = items.length + 1 + (didYouMean ? 1 : 0);
    if (event.key === 'Escape') {
      setIsOpen(false);
    } else if (event.key === 'ArrowDown' && showPanel) {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % rowCount);
    } else if (event.key === 'ArrowUp' && showPanel) {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? rowCount - 1 : index - 1));
    }
  };

  const rowId = (index: number) => `${listId}-${index}`;
  const rowClasses = (index: number) =>
    `flex w-full items-center gap-3 px-3 py-2 text-left text-sm ${
      activeIndex === index ? 'bg-mist' : 'hover:bg-mist'
    }`;

  return (
    <form
      ref={containerRef}
      role="search"
      onSubmit={handleSubmit}
      className="relative w-full lg:w-60"
    >
      <label htmlFor={inputId} className="sr-only">
        Search products
      </label>
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-graphite"
        aria-hidden
      />
      <input
        id={inputId}
        name="q"
        type="search"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showPanel && activeIndex >= 0 ? rowId(activeIndex) : undefined}
        autoComplete="off"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setActiveIndex(-1);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search products"
        className="h-9 w-full rounded-lg border border-transparent bg-mist pl-9 pr-3 text-sm text-ink placeholder:text-graphite focus:border-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-400/60"
      />

      {showPanel && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Search suggestions"
          // Wider than the input so product names fit; right-aligned on the narrow mobile row.
          className="absolute left-0 top-full z-50 mt-2 w-full min-w-[300px] overflow-hidden rounded-xl border border-line bg-white py-1 shadow-lg"
        >
          {items.map((product, index) => (
            <li key={product._id} role="presentation">
              <button
                type="button"
                role="option"
                id={rowId(index)}
                aria-selected={activeIndex === index}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(index)}
                className={rowClasses(index)}
              >
                <ImageWithFallback
                  src={product.imageUrl}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-md bg-mist object-cover"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-ink">{product.name}</span>
                  <span className="block truncate text-xs text-graphite">{product.category}</span>
                </span>
                <span className="shrink-0 text-[13px] font-semibold tabular-nums text-ink">
                  {formatCurrencyWhole(product.price)}
                </span>
              </button>
            </li>
          ))}
          {suggestions.isFetching && items.length === 0 && (
            <li role="presentation" className="px-3 py-2 text-xs text-graphite">
              Searching…
            </li>
          )}
          {suggestions.isSuccess && items.length === 0 && !didYouMean && trimmed === debounced && (
            <li role="presentation" className="px-3 py-2 text-xs text-graphite">
              No products match “{trimmed}”.
            </li>
          )}
          {didYouMean && (
            <li role="presentation">
              <button
                type="button"
                role="option"
                id={rowId(correctionRow)}
                aria-selected={activeIndex === correctionRow}
                onMouseEnter={() => setActiveIndex(correctionRow)}
                onClick={() => choose(correctionRow)}
                className={rowClasses(correctionRow)}
              >
                <span>
                  Did you mean <strong className="text-ink">{didYouMean}</strong>?
                </span>
              </button>
            </li>
          )}
          <li role="presentation" className="border-t border-line">
            <button
              type="button"
              role="option"
              id={rowId(searchRow)}
              aria-selected={activeIndex === searchRow}
              onMouseEnter={() => setActiveIndex(searchRow)}
              onClick={() => choose(searchRow)}
              className={rowClasses(searchRow)}
            >
              <Search size={15} className="shrink-0 text-graphite" aria-hidden />
              <span className="truncate">
                Search for <strong className="text-ink">“{trimmed}”</strong>
              </span>
            </button>
          </li>
        </ul>
      )}
    </form>
  );
}
