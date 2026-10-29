import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

type AlertProps = {
  variant: 'success' | 'error';
  children: ReactNode;
  className?: string;
};

export function Alert({ variant, children, className = '' }: AlertProps) {
  const isError = variant === 'error';
  const Icon = isError ? AlertCircle : CheckCircle2;

  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm ${
        isError
          ? 'border-red-200 bg-red-50 text-red-800'
          : 'border-green-200 bg-green-50 text-green-800'
      } ${className}`}
    >
      <Icon size={16} className="mt-0.5 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  );
}
