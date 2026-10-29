import type { ReactNode } from 'react';

type OrderSectionProps = {
  icon: ReactNode;
  title: string;
  children: ReactNode;
};

export function OrderSection({ icon, title, children }: OrderSectionProps) {
  return (
    <section className="border-b border-line pb-6 last:border-b-0 last:pb-0">
      <h2 className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-ink">
        {icon}
        {title}
      </h2>
      <div className="text-sm text-graphite">{children}</div>
    </section>
  );
}
