import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';

type StatusBadgeProps = {
  isDone: boolean;
  doneLabel: string;
  pendingLabel: string;
  date?: string;
};

/** Icon + text, so status never relies on colour alone. */
export function StatusBadge({ isDone, doneLabel, pendingLabel, date }: StatusBadgeProps) {
  const Icon = isDone ? CheckCircle2 : Clock;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        isDone ? 'bg-green-50 text-green-800' : 'bg-brand-50 text-ink'
      }`}
    >
      <Icon size={13} aria-hidden />
      {isDone ? `${doneLabel}${date ? ` ${formatDate(date)}` : ''}` : pendingLabel}
    </span>
  );
}

/** Shown instead of payment/delivery status once an unpaid order has expired. */
export function CancelledBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-800">
      <XCircle size={13} aria-hidden />
      Cancelled
    </span>
  );
}
