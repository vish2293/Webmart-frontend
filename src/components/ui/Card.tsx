import type { HTMLAttributes } from 'react';

/** Bordered surface. No shadow — hierarchy comes from borders and spacing. */
export function Card({ className = '', ...rest }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={`rounded-xl border border-line bg-white p-5 sm:p-6 ${className}`}
      {...rest}
    />
  );
}
