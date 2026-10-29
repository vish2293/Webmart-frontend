import { Loader2 } from 'lucide-react';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex min-h-[40vh] items-center justify-center gap-2.5 text-sm text-graphite"
    >
      <Loader2 size={18} className="animate-spin text-ink" aria-hidden />
      {label}
    </div>
  );
}
