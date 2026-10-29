import { Check } from 'lucide-react';

const steps = ['Shipping', 'Payment', 'Review'] as const;
export type CheckoutStep = (typeof steps)[number];

/** Real sequence, so numbered; completed steps get the volt marker. */
export function CheckoutSteps({ current }: { current: CheckoutStep }) {
  const currentIndex = steps.indexOf(current);

  return (
    <nav aria-label="Checkout progress" className="container pt-8 sm:pt-10">
      <ol className="mx-auto flex max-w-md items-center">
        {steps.map((step, index) => {
          const isCurrent = index === currentIndex;
          const isComplete = index < currentIndex;
          return (
            <li key={step} className="flex flex-1 items-center last:flex-none">
              <span
                aria-current={isCurrent ? 'step' : undefined}
                className={`flex items-center gap-2 text-[13px] font-medium ${
                  isCurrent || isComplete ? 'text-ink' : 'text-zinc-400'
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    isComplete
                      ? 'bg-brand-400 text-ink'
                      : isCurrent
                        ? 'bg-ink text-white'
                        : 'border border-line text-zinc-400'
                  }`}
                >
                  {isComplete ? <Check size={13} strokeWidth={3} aria-hidden /> : index + 1}
                </span>
                {step}
                {isComplete && <span className="sr-only">(completed)</span>}
              </span>
              {index < steps.length - 1 && (
                <span
                  aria-hidden
                  className={`mx-3 h-px flex-1 ${isComplete ? 'bg-ink' : 'bg-line'}`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
