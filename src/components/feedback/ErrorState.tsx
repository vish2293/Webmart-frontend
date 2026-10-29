import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  action?: ReactNode;
};

export function ErrorState({
  title = "This page didn't load",
  message,
  onRetry,
  action,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex min-h-[40vh] flex-col items-center justify-center p-4 text-center"
    >
      <AlertCircle size={28} className="mb-3 text-red-600" aria-hidden />
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-graphite">{message}</p>
      {(onRetry || action) && (
        <div className="mt-5 flex gap-2.5">
          {onRetry && <Button onClick={onRetry}>Try again</Button>}
          {action}
        </div>
      )}
    </div>
  );
}
