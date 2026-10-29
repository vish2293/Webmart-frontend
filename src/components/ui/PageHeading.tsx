import type { ReactNode } from 'react';

type PageHeadingProps = {
  children: ReactNode;
  /** Short supporting line, e.g. a result count. */
  description?: ReactNode;
  /** Right-aligned controls, e.g. a primary action. */
  actions?: ReactNode;
};

export function PageHeading({ children, description, actions }: PageHeadingProps) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[28px] font-bold leading-tight tracking-display text-ink">
          {children}
        </h1>
        {description && <p className="mt-1 text-sm text-graphite">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
