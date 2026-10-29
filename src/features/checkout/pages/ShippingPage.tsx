import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { FormCard } from '@/components/ui/FormCard';
import { TextField } from '@/components/ui/TextField';
import { useCart } from '@/features/cart';
import type { ShippingAddress } from '@/features/orders';
import { CheckoutSteps } from '../components/CheckoutSteps';
import { getShippingAddress, saveShippingAddress } from '../utils/checkoutStorage';

type AddressField = keyof ShippingAddress;

const fieldConfig: { field: AddressField; label: string; autoComplete: string }[] = [
  { field: 'address', label: 'Street address', autoComplete: 'street-address' },
  { field: 'city', label: 'City', autoComplete: 'address-level2' },
  { field: 'postalCode', label: 'Postal code', autoComplete: 'postal-code' },
  { field: 'country', label: 'Country', autoComplete: 'country-name' },
];

const emptyAddress: ShippingAddress = { address: '', city: '', postalCode: '', country: '' };

function validateAddress(values: ShippingAddress) {
  const errors: Partial<Record<AddressField, string>> = {};
  for (const { field, label } of fieldConfig) {
    if (!values[field].trim()) errors[field] = `${label} is required.`;
  }
  if (values.postalCode.trim() && !/^[A-Za-z0-9 -]{3,10}$/.test(values.postalCode.trim())) {
    errors.postalCode = 'Enter a valid postal code.';
  }
  return errors;
}

export default function ShippingPage() {
  const { items } = useCart();
  const navigate = useNavigate();
  const [values, setValues] = useState<ShippingAddress>(() => getShippingAddress() ?? emptyAddress);
  const [errors, setErrors] = useState<Partial<Record<AddressField, string>>>({});

  if (items.length === 0) return <Navigate to="/cart" replace />;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validateAddress(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    saveShippingAddress({
      address: values.address.trim(),
      city: values.city.trim(),
      postalCode: values.postalCode.trim(),
      country: values.country.trim(),
    });
    navigate('/checkout/payment');
  };

  return (
    <div>
      <CheckoutSteps current="Shipping" />
      <FormCard title="Shipping address">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {fieldConfig.map(({ field, label, autoComplete }) => (
            <TextField
              key={field}
              label={label}
              autoComplete={autoComplete}
              value={values[field]}
              onChange={(event) =>
                setValues((current) => ({ ...current, [field]: event.target.value }))
              }
              error={errors[field]}
              required
            />
          ))}
          <div className="flex flex-col gap-3 pt-2">
            <Button type="submit" className="w-full" icon={<ArrowRight size={18} aria-hidden />}>
              Continue to payment
            </Button>
            <ButtonLink to="/cart" variant="secondary" className="w-full">
              Back to cart
            </ButtonLink>
          </div>
        </form>
      </FormCard>
    </div>
  );
}
