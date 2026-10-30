import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, X } from 'lucide-react';
import { onToast, type Toast } from '@/lib/toast';

const visibleMs = 3500;

/** Bottom-of-screen confirmations ("added to cart", "added to wishlist") with an optional link. */
export function Toaster() {
  const [toast, setToast] = useState<Toast | null>(null);

  // A new object per toast restarts the hide timer when several fire in a row.
  useEffect(() => onToast((next) => setToast({ ...next })), []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), visibleMs);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
    >
      {toast && (
        <div className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-lg border border-line bg-white px-4 py-3 text-sm shadow-lg">
          <CheckCircle2 size={20} className="shrink-0 text-green-600" aria-hidden />
          <p className="min-w-0 flex-1 truncate font-medium text-ink">
            {toast.message}
            {toast.detail && <span className="sr-only">: {toast.detail}</span>}
          </p>
          {toast.action && (
            <Link
              to={toast.action.to}
              onClick={() => setToast(null)}
              className="shrink-0 font-semibold text-ink underline decoration-brand-400 decoration-2 underline-offset-4 hover:decoration-ink"
            >
              {toast.action.label}
            </Link>
          )}
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss"
            className="shrink-0 rounded p-1 text-graphite hover:text-ink"
          >
            <X size={16} aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
