import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, CreditCard, Smartphone, Wallet, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { FormCard } from '@/components/ui/FormCard';
import { useCart } from '@/features/cart';
import type { PaymentMethod } from '@/features/orders';
import { CheckoutSteps } from '../components/CheckoutSteps';
import { getPaymentMethod, getShippingAddress, savePaymentMethod } from '../utils/checkoutStorage';

const paymentOptions: { value: PaymentMethod; label: string; Icon: LucideIcon }[] = [
  { value: 'UPI', label: 'UPI (Google Pay, PhonePe, Paytm)', Icon: Smartphone },
  { value: 'Card', label: 'Credit / Debit card', Icon: CreditCard },
  { value: 'Cash on Delivery', label: 'Cash on delivery', Icon: Wallet },
];

export default function PaymentPage() {
  const { items } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    () => getPaymentMethod() ?? 'UPI',
  );

  if (items.length === 0) return <Navigate to="/cart" replace />;
  if (!getShippingAddress()) return <Navigate to="/checkout/shipping" replace />;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    savePaymentMethod(paymentMethod);
    navigate('/checkout/review');
  };

  return (
    <div>
      <CheckoutSteps current="Payment" />
      <FormCard title="Payment method">
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset className="space-y-3">
            <legend className="sr-only">Choose a payment method</legend>
            {paymentOptions.map(({ value, label, Icon }) => (
              <label
                key={value}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
                  paymentMethod === value
                    ? 'border-ink bg-brand-50'
                    : 'border-slate-200 bg-mist hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={value}
                  checked={paymentMethod === value}
                  onChange={() => setPaymentMethod(value)}
                  className="h-5 w-5 accent-ink"
                />
                <Icon size={20} className="text-graphite" aria-hidden />
                <span className="font-medium text-ink">{label}</span>
              </label>
            ))}
          </fieldset>
          <div className="flex flex-col gap-3 pt-2">
            <Button type="submit" className="w-full" icon={<ArrowRight size={18} aria-hidden />}>
              Review order
            </Button>
            <ButtonLink to="/checkout/shipping" variant="secondary" className="w-full">
              Back to shipping
            </ButtonLink>
          </div>
        </form>
      </FormCard>
    </div>
  );
}
