import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';

type FormCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

/** Narrow centered form panel used by login, register, profile and checkout forms. */
export function FormCard({ title, description, children, footer }: FormCardProps) {
  return (
    <div className="flex justify-center px-4 py-10 sm:py-14">
      <Card className="w-full max-w-[420px] sm:p-8">
        <h1 className="text-2xl font-bold tracking-display text-ink">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-graphite">{description}</p>}
        <div className="mt-6">{children}</div>
        {footer && (
          <div className="mt-6 border-t border-line pt-5 text-sm text-graphite">{footer}</div>
        )}
      </Card>
    </div>
  );
}
