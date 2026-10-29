import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { formatCurrencyWhole } from '@/utils/formatCurrency';
import type { Product } from '../types';

const slideIntervalMs = 5000;

export type HeroSlide = {
  id: string;
  tone: 'yellow' | 'dark';
  /** Two short headline lines; the second ends with the brand full stop. */
  heading: [string, string];
  /** Line above the big price, e.g. "Beauty picks from". */
  lead: string;
  startingPrice?: number;
  /** Up to four products for the collage. */
  products: Product[];
  cta: { to: string; label: string };
  footnote?: string;
};

const tones = {
  yellow: {
    section: 'bg-brand-400 bg-[radial-gradient(circle_at_28%_45%,#FFE082_0%,transparent_55%)]',
    text: 'text-ink',
    dot: 'text-white',
    stage: 'bg-white/35',
    button: 'dark',
  },
  dark: {
    section: 'bg-ink bg-[radial-gradient(circle_at_28%_45%,#27272A_0%,transparent_60%)]',
    text: 'text-white',
    dot: 'text-brand-400',
    stage: 'bg-white/[0.06] ring-1 ring-brand-400/40',
    button: 'primary',
  },
} as const;

/**
 * Collage positions for up to four product cut-outs, each with a hand-drawn callout. Callouts
 * sit on the outer edge of each item (`labelBelow` for the bottom one) so none lands on a
 * neighbouring product.
 */
const collageSlots = [
  { box: 'left-[-2%] top-[30%] w-[38%] z-10', arrow: 'right', labelBelow: false },
  { box: 'left-[28%] top-[-4%] w-[44%]', arrow: 'right', labelBelow: false },
  { box: 'right-[-2%] top-[18%] w-[38%] z-10', arrow: 'left', labelBelow: false },
  { box: 'right-[22%] top-[50%] w-[38%] z-20', arrow: 'left', labelBelow: true },
] as const;

type CollageSlot = (typeof collageSlots)[number];

function CalloutArrow({ slot }: { slot: CollageSlot }) {
  return (
    <svg
      viewBox="0 0 48 32"
      className={`h-6 w-9 ${slot.arrow === 'left' ? '-scale-x-100' : ''} ${slot.labelBelow ? '-scale-y-100' : ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 4c14 0 26 6 32 22" />
      <path d="M28 22l8 5 3-9" />
    </svg>
  );
}

function CollageItem({
  product,
  slot,
  isActive,
}: {
  product: Product;
  slot: CollageSlot;
  isActive: boolean;
}) {
  const align = slot.arrow === 'left' ? 'items-end text-right' : 'items-start';
  const direction = slot.labelBelow ? 'flex-col-reverse' : 'flex-col';
  return (
    <Link
      to={`/products/${product._id}`}
      tabIndex={isActive ? undefined : -1}
      className={`group absolute flex ${direction} ${align} ${slot.box}`}
    >
      <span className={`flex ${direction} ${align}`}>
        <span className="max-w-[14ch] text-[12px] font-bold leading-tight sm:text-[13px]">
          {product.name}
        </span>
        <CalloutArrow slot={slot} />
      </span>
      <ImageWithFallback
        src={product.imageUrl}
        alt=""
        loading="eager"
        className="aspect-square w-full object-contain drop-shadow-[0_18px_24px_rgba(0,0,0,0.3)] transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-[1.03]"
      />
    </Link>
  );
}

function Slide({
  slide,
  isActive,
  index,
  total,
}: {
  slide: HeroSlide;
  isActive: boolean;
  index: number;
  total: number;
}) {
  const tone = tones[slide.tone];
  // Only the first slide's headline is the page h1; the rest are h2s.
  const HeadingTag = index === 0 ? 'h1' : 'h2';
  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${total}`}
      aria-hidden={!isActive}
      // All slides share one grid cell so the tallest sets the height and they crossfade.
      // `invisible` also removes inactive slides from the tab order.
      className={`[grid-area:1/1] transition-opacity duration-700 ${tone.section} ${tone.text} ${
        isActive ? 'visible opacity-100' : 'invisible opacity-0'
      }`}
    >
      <div className="container grid items-center gap-8 pb-16 pt-12 sm:pt-14 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:pb-20 lg:pt-16">
        <div className="lg:order-2">
          <HeadingTag className="text-[44px] font-extrabold leading-[0.95] tracking-display sm:text-[64px] xl:text-[76px]">
            {slide.heading[0]}
            <br />
            {slide.heading[1]}
            <span className={tone.dot}>.</span>
          </HeadingTag>
          {slide.startingPrice !== undefined && (
            <p className="mt-6">
              <span className="block text-lg font-semibold sm:text-xl">{slide.lead}</span>
              <span className="mt-1 block text-[56px] font-extrabold leading-none tracking-display tabular-nums sm:text-[72px]">
                {formatCurrencyWhole(slide.startingPrice)}
              </span>
            </p>
          )}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <ButtonLink
              to={slide.cta.to}
              size="lg"
              variant={tone.button}
              tabIndex={isActive ? undefined : -1}
            >
              {slide.cta.label}
            </ButtonLink>
            {slide.footnote && <p className="text-sm font-semibold">{slide.footnote}</p>}
          </div>
        </div>

        {slide.products.length > 0 && (
          <div className="relative mx-auto aspect-[5/4] w-full max-w-[640px] lg:order-1">
            <div
              aria-hidden
              className={`absolute left-1/2 top-1/2 aspect-square w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full ${tone.stage}`}
            />
            {collageSlots.map((slot, slotIndex) => {
              const product = slide.products[slotIndex];
              return (
                product && (
                  <CollageItem
                    key={product._id}
                    product={product}
                    slot={slot}
                    isActive={isActive}
                  />
                )
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Full-bleed campaign carousel. Auto-advances every 5s; pauses on hover/focus, has a visible
 * pause control (WCAG 2.2.2) and never autoplays for reduced-motion users.
 */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(prefersReducedMotion);
  const [isInteracting, setIsInteracting] = useState(false);
  const slideCount = slides.length;
  const isAutoplaying = slideCount > 1 && !isPaused && !isInteracting;

  useEffect(() => {
    if (!isAutoplaying) return;
    const timer = window.setTimeout(
      () => setActiveIndex((index) => (index + 1) % slideCount),
      slideIntervalMs,
    );
    return () => window.clearTimeout(timer);
  }, [isAutoplaying, activeIndex, slideCount]);

  if (slideCount === 0) return null;

  const goTo = (index: number) => setActiveIndex((index + slideCount) % slideCount);
  const activeTone = slides[activeIndex]?.tone ?? 'yellow';
  const controlClasses =
    activeTone === 'dark'
      ? 'bg-white/10 text-white hover:bg-white/20'
      : 'bg-ink/10 text-ink hover:bg-ink/20';

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className="relative"
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onFocus={() => setIsInteracting(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsInteracting(false);
      }}
    >
      <div className="grid overflow-hidden">
        {slides.map((slide, index) => (
          <Slide
            key={slide.id}
            slide={slide}
            index={index}
            total={slideCount}
            isActive={index === activeIndex}
          />
        ))}
      </div>

      {slideCount > 1 && (
        <div className="absolute inset-x-0 bottom-4 z-30">
          <div className="container flex items-center justify-center gap-2 lg:justify-start">
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${controlClasses}`}
              aria-label="Previous slide"
            >
              <ChevronLeft size={16} aria-hidden />
            </button>
            <div className="flex items-center gap-1.5 px-1">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === activeIndex ? 'true' : undefined}
                  className={`h-2 rounded-full transition-all ${
                    index === activeIndex
                      ? `w-6 ${activeTone === 'dark' ? 'bg-brand-400' : 'bg-ink'}`
                      : `w-2 ${activeTone === 'dark' ? 'bg-white/40' : 'bg-ink/30'}`
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${controlClasses}`}
              aria-label="Next slide"
            >
              <ChevronRight size={16} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setIsPaused((paused) => !paused)}
              className={`ml-1 flex h-8 w-8 items-center justify-center rounded-full transition-colors ${controlClasses}`}
              aria-label={isPaused ? 'Play slideshow' : 'Pause slideshow'}
            >
              {isPaused ? <Play size={14} aria-hidden /> : <Pause size={14} aria-hidden />}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
