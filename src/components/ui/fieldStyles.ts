export const fieldClasses = (hasError: boolean) =>
  `w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink placeholder:text-zinc-400 read-only:bg-mist read-only:text-graphite focus:border-ink focus:outline-none focus:ring-2 focus:ring-brand-400/60 ${
    hasError ? 'border-red-600' : 'border-line'
  }`;

export const labelClasses = 'mb-1.5 block text-[13px] font-medium text-ink';
