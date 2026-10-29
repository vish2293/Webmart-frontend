import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

/** Must match ORDER_PAYMENT_WINDOW_MINUTES on the server. */
export const paymentWindowMinutes = 30;

const pad = (value: number) => String(value).padStart(2, '0');

/**
 * Tells a customer with an unpaid online order how long their items are still held, and what
 * their options are. The server cancels the order (and frees the stock) once the time is up.
 */
export function PaymentHold({ createdAt }: { createdAt: string }) {
  const expiresAt = Date.parse(createdAt) + paymentWindowMinutes * 60_000;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const secondsLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));

  return (
    <div className="mb-6 flex items-start gap-2 rounded-lg border border-line bg-mist px-3 py-2.5 text-sm text-ink">
      <Clock size={16} className="mt-0.5 shrink-0" aria-hidden />
      {secondsLeft > 0 ? (
        <p>
          <strong>Payment pending.</strong> Your items are held for{' '}
          <span className="font-semibold tabular-nums">
            {pad(Math.floor(secondsLeft / 60))}:{pad(secondsLeft % 60)}
          </span>
          . Pay to confirm the order, or cancel it to release the items.
        </p>
      ) : (
        <p>
          <strong>Payment window closed.</strong> This order is being cancelled and the items
          released. Please place a new order.
        </p>
      )}
    </div>
  );
}
