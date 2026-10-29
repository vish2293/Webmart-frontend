import { useState } from 'react';
import { X } from 'lucide-react';
import { pricingRules } from '@/features/cart';
import { readJson, writeJson } from '@/lib/storage';
import { formatCurrencyWhole } from '@/utils/formatCurrency';

// Bump the version when the message changes so people who dismissed the old one see it.
const dismissedKey = 'announcement:dismissed:v1';

export function AnnouncementBar() {
  const [isDismissed, setIsDismissed] = useState(() => readJson(dismissedKey, false));

  if (isDismissed) return null;

  return (
    <div className="relative bg-ink text-white">
      <p className="container py-2 pr-10 text-center text-[13px] font-medium">
        Free shipping on orders over{' '}
        <span className="text-brand-400">
          {formatCurrencyWhole(pricingRules.freeShippingThreshold)}
        </span>
        . We never ask for payment outside this website.
      </p>
      <button
        type="button"
        onClick={() => {
          writeJson(dismissedKey, true);
          setIsDismissed(true);
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-zinc-400 hover:text-white"
        aria-label="Dismiss announcement"
      >
        <X size={14} aria-hidden />
      </button>
    </div>
  );
}
