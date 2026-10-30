import type { ReactNode } from 'react';
import { Check } from 'lucide-react';

export type StepState = 'active' | 'done' | 'upcoming';

type CheckoutStepCardProps = {
  number: number;
  title: string;
  state: StepState;
  /** One-line recap shown beside the title once the step is done. */
  summary?: ReactNode;
  onEdit?: () => void;
  children: ReactNode;
};

/**
 * One step of the single-page checkout. Only the active step is open; a finished step folds
 * into a summary with a Change button. The body stays mounted so opening and closing can animate
 * (and so typed values survive); `invisible` keeps a folded body out of the tab order.
 */
export function CheckoutStepCard({
  number,
  title,
  state,
  summary,
  onEdit,
  children,
}: Readonly<CheckoutStepCardProps>) {
  const isActive = state === 'active';
  const headingId = `checkout-step-${number}`;

  return (
    <section
      aria-labelledby={headingId}
      aria-current={isActive ? 'step' : undefined}
      className={`rounded-xl border bg-white p-5 transition-colors sm:p-6 ${
        isActive ? 'border-ink' : 'border-line'
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            state === 'done'
              ? 'bg-brand-400 text-ink'
              : isActive
                ? 'bg-ink text-white'
                : 'border border-line text-zinc-400'
          }`}
        >
          {state === 'done' ? <Check size={14} strokeWidth={3} /> : number}
        </span>
        <h2
          id={headingId}
          className={`text-base font-semibold ${state === 'upcoming' ? 'text-zinc-400' : 'text-ink'}`}
        >
          {title}
          {state === 'done' && <span className="sr-only"> (completed)</span>}
        </h2>
        {state === 'done' && onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="ml-auto text-sm font-medium text-ink underline decoration-brand-400 decoration-2 underline-offset-4 hover:decoration-ink"
          >
            Change<span className="sr-only"> {title.toLowerCase()}</span>
          </button>
        )}
      </div>

      {state === 'done' && summary && (
        <div className="mt-2 pl-10 text-sm text-graphite">{summary}</div>
      )}

      <div
        className={`grid transition-[grid-template-rows,visibility] duration-300 ease-out motion-reduce:transition-none ${
          isActive ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="p-0.5 pt-5">{children}</div>
        </div>
      </div>
    </section>
  );
}
