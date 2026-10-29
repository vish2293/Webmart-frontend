import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '../../types';
import { ProductCard } from '../ProductCard';

/** Horizontally scrolling row of product cards with snap points and prev/next buttons. */
export function ProductRail({ products, label }: { products: Product[]; label: string }) {
  const railRef = useRef<HTMLUListElement>(null);

  const scrollByPage = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    rail.scrollBy({
      left: direction * rail.clientWidth * 0.85,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };

  const buttonClasses =
    'absolute top-1/3 z-10 hidden h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink shadow-sm transition-colors hover:border-ink md:flex';

  // The scrolling list is `relative` itself: absolutely positioned children (the cards' sr-only
  // text) are only clipped by a scroll container that is also their containing block.
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => scrollByPage(-1)}
        className={`${buttonClasses} -left-5`}
        aria-label={`Scroll ${label} left`}
      >
        <ChevronLeft size={18} aria-hidden />
      </button>
      <ul
        ref={railRef}
        aria-label={label}
        className="relative -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <li key={product._id} className="flex w-[200px] shrink-0 snap-start sm:w-[230px]">
            <div className="flex w-full">
              <ProductCard product={product} />
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => scrollByPage(1)}
        className={`${buttonClasses} -right-5`}
        aria-label={`Scroll ${label} right`}
      >
        <ChevronRight size={18} aria-hidden />
      </button>
    </div>
  );
}
