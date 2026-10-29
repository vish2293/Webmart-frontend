export type ButtonVariant = 'primary' | 'secondary' | 'dark' | 'danger' | 'success' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-40';

const variants: Record<ButtonVariant, string> = {
  /** Brand CTA: brand fill, black text. One per view. */
  primary: 'bg-brand-400 text-ink hover:bg-brand-500',
  /** Outlined, for secondary actions. */
  secondary: 'border border-line bg-white text-ink hover:border-ink',
  /** Solid black, for strong actions next to (not instead of) the brand CTA. */
  dark: 'bg-ink text-white hover:bg-ink-700',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  success: 'bg-green-700 text-white hover:bg-green-800',
  ghost: 'text-ink hover:bg-mist',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-[15px]',
};

export const buttonClasses = (
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className = '',
) => `${base} ${variants[variant]} ${sizes[size]} ${className}`;
