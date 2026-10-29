import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import type { AddressInput } from '../types';

type Field = 'label' | 'address' | 'city' | 'postalCode' | 'country';

const fields: { field: Field; label: string; autoComplete: string }[] = [
  { field: 'label', label: 'Label (Home, Work…)', autoComplete: 'off' },
  { field: 'address', label: 'Street address', autoComplete: 'street-address' },
  { field: 'city', label: 'City', autoComplete: 'address-level2' },
  { field: 'postalCode', label: 'Postal code', autoComplete: 'postal-code' },
  { field: 'country', label: 'Country', autoComplete: 'country-name' },
];

const emptyAddress: AddressInput = {
  label: 'Home',
  address: '',
  city: '',
  postalCode: '',
  country: 'India',
  isDefault: false,
};

function validate(values: AddressInput) {
  const errors: Partial<Record<Field, string>> = {};
  for (const { field, label } of fields) {
    if (!values[field].trim()) errors[field] = `${label.split(' (')[0]} is required.`;
  }
  if (values.postalCode.trim() && !/^[A-Za-z0-9 -]{3,10}$/.test(values.postalCode.trim())) {
    errors.postalCode = 'Enter a valid postal code.';
  }
  return errors;
}

type AddressFormProps = {
  initial?: AddressInput;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (values: AddressInput) => void;
  onCancel: () => void;
};

/** Add / edit form for one saved address. */
export function AddressForm({
  initial = emptyAddress,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: AddressFormProps) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit({
      label: values.label.trim(),
      address: values.address.trim(),
      city: values.city.trim(),
      postalCode: values.postalCode.trim(),
      country: values.country.trim(),
      isDefault: values.isDefault,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      {fields.map(({ field, label, autoComplete }) => (
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
      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={values.isDefault}
          onChange={(event) =>
            setValues((current) => ({ ...current, isDefault: event.target.checked }))
          }
          className="h-4 w-4 accent-brand-500"
        />
        Use as my default address
      </label>
      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
        <Button variant="secondary" size="sm" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
