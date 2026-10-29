import { useId, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';

export function HeaderSearch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inputId = useId();
  const currentKeyword = searchParams.get('q') ?? '';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const keyword = new FormData(event.currentTarget).get('q');
    const trimmed = typeof keyword === 'string' ? keyword.trim() : '';
    navigate(trimmed ? `/products?q=${encodeURIComponent(trimmed)}` : '/products');
  };

  return (
    <form
      key={currentKeyword}
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
        defaultValue={currentKeyword}
        placeholder="Search products"
        className="h-9 w-full rounded-lg border border-transparent bg-mist pl-9 pr-3 text-sm text-ink placeholder:text-graphite focus:border-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-400/60"
      />
    </form>
  );
}
