import { ArrowRight, CreditCard, Smartphone, Wallet, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { DeliveryOption, PaymentMethod } from '@/features/orders';
import { DeliveryOptions } from './DeliveryOptions';

const allPaymentOptions: {
  value: PaymentMethod;
  label: string;
  detail: string;
  Icon: LucideIcon;
}[] = [
  {
    value: 'UPI',
    label: 'UPI',
    detail: 'Google Pay, PhonePe, Paytm and other UPI apps, through Razorpay.',
    Icon: Smartphone,
  },
  {
    value: 'Card',
    label: 'Card with Razorpay',
    detail: 'Credit or debit card, through Razorpay.',
    Icon: CreditCard,
  },
  {
    value: 'Stripe',
    label: 'Card with Stripe',
    detail: 'Credit or debit card on Stripe’s secure page.',
    Icon: CreditCard,
  },
  {
    value: 'Cash on Delivery',
    label: 'Cash on delivery',
    detail: 'Pay in cash when your order arrives.',
    Icon: Wallet,
  },
];

type PaymentStepProps = {
  paymentMethod: PaymentMethod | null;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  deliveryOption: DeliveryOption;
  onDeliveryOptionChange: (option: DeliveryOption) => void;
  isMember: boolean;
  /** Stripe is only offered when the server has it configured. */
  isStripeAvailable: boolean;
  onContinue: () => void;
};

/** How fast it arrives, and how the customer pays: UPI or card (Razorpay), Stripe, or cash. */
export function PaymentStep({
  paymentMethod,
  onPaymentMethodChange,
  deliveryOption,
  onDeliveryOptionChange,
  isMember,
  isStripeAvailable,
  onContinue,
}: Readonly<PaymentStepProps>) {
  const paymentOptions = allPaymentOptions.filter(
    (option) => option.value !== 'Stripe' || isStripeAvailable,
  );
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-ink">Delivery</h3>
        <DeliveryOptions
          value={deliveryOption}
          onChange={onDeliveryOptionChange}
          isMember={isMember}
        />
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink">Payment</legend>
        {/* One option per row: the checkout card is too narrow for three side by side. */}
        <div className="grid gap-3">
          {paymentOptions.map(({ value, label, detail, Icon }) => (
            <label
              key={value}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                paymentMethod === value ? 'border-ink bg-brand-50' : 'border-line hover:bg-mist'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={value}
                checked={paymentMethod === value}
                onChange={() => onPaymentMethodChange(value)}
                className="h-4 w-4 shrink-0 accent-ink"
              />
              <span
                aria-hidden
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  paymentMethod === value ? 'bg-brand-400 text-ink' : 'bg-mist text-ink'
                }`}
              >
                <Icon size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-ink">{label}</span>
                <span className="mt-0.5 block text-sm text-graphite">{detail}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <Button
        type="button"
        onClick={onContinue}
        disabled={!paymentMethod}
        icon={<ArrowRight size={18} aria-hidden />}
      >
        Review order
      </Button>
    </div>
  );
}
