import { ArrowRight, CreditCard, Wallet, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { DeliveryOption, PaymentMethod } from '@/features/orders';
import { DeliveryOptions } from './DeliveryOptions';

const paymentOptions: {
  value: PaymentMethod;
  label: string;
  detail: string;
  Icon: LucideIcon;
}[] = [
  {
    value: 'Razorpay',
    label: 'Pay online',
    detail: 'UPI, cards, net banking and wallets. Razorpay opens when you place the order.',
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
  onContinue: () => void;
};

/** How fast it arrives, and how the customer pays: Razorpay or cash on delivery. */
export function PaymentStep({
  paymentMethod,
  onPaymentMethodChange,
  deliveryOption,
  onDeliveryOptionChange,
  isMember,
  onContinue,
}: Readonly<PaymentStepProps>) {
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
        <div className="grid gap-3 md:grid-cols-2">
          {paymentOptions.map(({ value, label, detail, Icon }) => (
            // The label text sits three elements deep, past the rule's depth limit.
            // eslint-disable-next-line jsx-a11y/label-has-associated-control
            <label
              key={value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                paymentMethod === value ? 'border-ink bg-brand-50' : 'border-line hover:bg-mist'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={value}
                checked={paymentMethod === value}
                onChange={() => onPaymentMethodChange(value)}
                className="mt-1 h-4 w-4 accent-ink"
              />
              <span className="flex-1">
                <span className="flex items-center gap-2 font-semibold text-ink">
                  <Icon size={18} aria-hidden /> {label}
                </span>
                <span className="mt-1 block text-sm text-graphite">{detail}</span>
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
