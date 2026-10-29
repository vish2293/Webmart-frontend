import { useId } from 'react';
import { pricingRules } from '@/features/cart';
import type { DeliveryOption } from '@/features/orders';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';

type DeliveryOptionsProps = {
  value: DeliveryOption;
  onChange: (option: DeliveryOption) => void;
  /** Plus members get express delivery at no charge. */
  isMember: boolean;
  disabled?: boolean;
};

const arrivesBy = (days: number) =>
  formatDate(new Date(Date.now() + days * 24 * 60 * 60_000).toISOString());

export function DeliveryOptions({ value, onChange, isMember, disabled }: DeliveryOptionsProps) {
  const name = useId();
  const options: { value: DeliveryOption; label: string; detail: string; price: string }[] = [
    {
      value: 'standard',
      label: 'Standard delivery',
      detail: `Arrives by ${arrivesBy(pricingRules.standardDeliveryDays)}`,
      price: 'Included',
    },
    {
      value: 'express',
      label: 'Express delivery',
      detail: `Arrives by ${arrivesBy(pricingRules.expressDeliveryDays)}`,
      price: isMember ? 'Free with Plus' : `+ ${formatCurrency(pricingRules.expressDeliveryPrice)}`,
    },
  ];

  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="sr-only">Delivery speed</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${
            value === option.value ? 'border-ink bg-brand-50' : 'border-line hover:bg-mist'
          }`}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="h-4 w-4 accent-ink"
          />
          <span className="flex-1">
            <span className="block font-medium text-ink">{option.label}</span>
            <span className="block text-xs text-graphite">{option.detail}</span>
          </span>
          <span className="font-semibold text-ink">{option.price}</span>
        </label>
      ))}
    </fieldset>
  );
}
