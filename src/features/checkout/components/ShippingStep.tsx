import { useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useAddAddress, useAddresses, type SavedAddress } from '@/features/addresses';
import type { ShippingAddress } from '@/features/orders';

type AddressField = keyof ShippingAddress;

const fieldConfig: {
  field: AddressField;
  label: string;
  autoComplete: string;
  className?: string;
}[] = [
  {
    field: 'address',
    label: 'Street address',
    autoComplete: 'street-address',
    className: 'sm:col-span-2',
  },
  { field: 'city', label: 'City', autoComplete: 'address-level2' },
  { field: 'postalCode', label: 'Postal code', autoComplete: 'postal-code' },
  { field: 'country', label: 'Country', autoComplete: 'country-name', className: 'sm:col-span-2' },
];

const emptyAddress: ShippingAddress = { address: '', city: '', postalCode: '', country: '' };
const newAddressChoice = 'new';

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

const toShippingAddress = (saved: SavedAddress): ShippingAddress => ({
  address: saved.address,
  city: saved.city,
  postalCode: saved.postalCode,
  country: saved.country,
});

const isSameAddress = (a: ShippingAddress, b: ShippingAddress) =>
  fieldConfig.every(({ field }) => a[field].trim() === b[field].trim());

type ShippingStepProps = {
  /** The address used last, if any: preselected and used to prefill the form. */
  lastUsed: ShippingAddress | null;
  onContinue: (address: ShippingAddress) => void;
};

/** Pick a saved address or enter a new one (optionally saving it to the address book). */
export function ShippingStep({ lastUsed, onContinue }: Readonly<ShippingStepProps>) {
  const addresses = useAddresses();
  const addAddress = useAddAddress();
  const saved = addresses.data ?? [];

  const [newValues, setNewValues] = useState<ShippingAddress>(() => lastUsed ?? emptyAddress);
  const [errors, setErrors] = useState<Partial<Record<AddressField, string>>>({});
  const [choice, setChoice] = useState<string | null>(null);
  const [shouldSave, setShouldSave] = useState(true);

  // Until the customer picks: the address they used last (if it's saved), else their default,
  // else a blank form. Derived each render, so it settles by itself once the list loads.
  const lastUsedSaved = lastUsed
    ? saved.find((a) => isSameAddress(toShippingAddress(a), lastUsed))
    : undefined;
  const preferred = lastUsedSaved ?? (lastUsed ? undefined : saved.find((a) => a.isDefault));
  const selectedId = choice ?? preferred?._id ?? newAddressChoice;
  const selectedSaved = saved.find((a) => a._id === selectedId);
  const isNewAddress = !selectedSaved;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    let address: ShippingAddress;
    if (selectedSaved) {
      address = toShippingAddress(selectedSaved);
    } else {
      const nextErrors = validateAddress(newValues);
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;
      address = {
        address: newValues.address.trim(),
        city: newValues.city.trim(),
        postalCode: newValues.postalCode.trim(),
        country: newValues.country.trim(),
      };
      // Saving is a convenience: if it fails, checkout continues with this address anyway.
      if (shouldSave && !saved.some((a) => isSameAddress(toShippingAddress(a), address))) {
        await addAddress
          .mutateAsync({
            label: saved.length === 0 ? 'Home' : 'Other',
            ...address,
            isDefault: false,
          })
          .catch(() => undefined);
      }
    }
    onContinue(address);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {saved.length > 0 && (
        <fieldset className="grid gap-3 md:grid-cols-2">
          <legend className="sr-only">Choose a saved address</legend>
          {[...saved, null].map((option) => {
            const id = option?._id ?? newAddressChoice;
            return (
              <label
                key={id}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 text-sm transition-colors ${
                  selectedId === id ? 'border-ink bg-brand-50' : 'border-line hover:bg-mist'
                }`}
              >
                <input
                  type="radio"
                  name="savedAddress"
                  checked={selectedId === id}
                  onChange={() => setChoice(id)}
                  className="mt-0.5 h-4 w-4 accent-ink"
                />
                {option ? (
                  <span>
                    <span className="block font-semibold text-ink">
                      {option.label}
                      {option.isDefault && (
                        <span className="ml-2 rounded-full bg-brand-400 px-2 py-0.5 text-[11px]">
                          Default
                        </span>
                      )}
                    </span>
                    <span className="block text-graphite">
                      {option.address}, {option.city}, {option.postalCode}, {option.country}
                    </span>
                  </span>
                ) : (
                  <span className="font-semibold text-ink">Use a different address</span>
                )}
              </label>
            );
          })}
        </fieldset>
      )}

      {isNewAddress && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {fieldConfig.map(({ field, label, autoComplete, className }) => (
              <TextField
                key={field}
                className={className}
                label={label}
                autoComplete={autoComplete}
                value={newValues[field]}
                onChange={(event) =>
                  setNewValues((current) => ({ ...current, [field]: event.target.value }))
                }
                error={errors[field]}
                required
              />
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={shouldSave}
              onChange={(event) => setShouldSave(event.target.checked)}
              className="h-4 w-4 accent-brand-500"
            />
            Save this address for next time
          </label>
        </>
      )}

      <Button
        type="submit"
        isLoading={addAddress.isPending}
        icon={<ArrowRight size={18} aria-hidden />}
      >
        Continue
      </Button>
    </form>
  );
}
