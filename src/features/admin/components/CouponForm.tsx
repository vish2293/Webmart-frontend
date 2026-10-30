import { useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { fieldClasses, labelClasses } from '@/components/ui/fieldStyles';
import { TextField } from '@/components/ui/TextField';
import type { CouponInput, CouponType } from '../api/couponsApi';

type Field =
  'code' | 'value' | 'maxDiscount' | 'minOrderValue' | 'perUserLimit' | 'usageLimit' | 'expiresAt';

type FormState = {
  code: string;
  description: string;
  type: CouponType;
  value: string;
  maxDiscount: string;
  minOrderValue: string;
  perUserLimit: string;
  usageLimit: string;
  startsAt: string;
  expiresAt: string;
};

const emptyForm: FormState = {
  code: '',
  description: '',
  type: 'percent',
  value: '',
  maxDiscount: '',
  minOrderValue: '0',
  perUserLimit: '1',
  usageLimit: '',
  startsAt: '',
  expiresAt: '',
};

/** Blank means "not set". Anything else must be a number. */
const toNumber = (text: string) => (text.trim() === '' ? undefined : Number(text));
const toIso = (local: string) => (local ? new Date(local).toISOString() : undefined);

function validate(form: FormState) {
  const errors: Partial<Record<Field, string>> = {};
  if (!/^[A-Za-z0-9_-]{3,32}$/.test(form.code.trim())) {
    errors.code = 'Use 3-32 letters, digits, - or _.';
  }
  const value = Number(form.value);
  if (!(value > 0)) errors.value = 'Enter an amount above 0.';
  else if (form.type === 'percent' && value > 100) errors.value = 'A percentage is at most 100.';
  const optional = (field: 'maxDiscount' | 'usageLimit', integer: boolean, min: number) => {
    const number = toNumber(form[field]);
    if (number === undefined) return;
    if (!Number.isFinite(number) || number < min || (integer && !Number.isInteger(number))) {
      errors[field] = integer
        ? `Enter a whole number, ${min} or more.`
        : 'Enter an amount above 0.';
    }
  };
  optional('maxDiscount', false, 0.01);
  optional('usageLimit', true, 1);
  if (!(Number(form.minOrderValue) >= 0)) errors.minOrderValue = 'Enter 0 or more.';
  const perUser = Number(form.perUserLimit);
  if (!Number.isInteger(perUser) || perUser < 1)
    errors.perUserLimit = 'Enter a whole number, 1 or more.';
  if (form.startsAt && form.expiresAt && new Date(form.expiresAt) <= new Date(form.startsAt)) {
    errors.expiresAt = 'Expiry must be after the start.';
  }
  return errors;
}

type CouponFormProps = {
  isSubmitting: boolean;
  onSubmit: (input: CouponInput) => void;
  onCancel: () => void;
};

/** Create a coupon. Existing coupons are changed from the list (switch off, delete). */
export function CouponForm({ isSubmitting, onSubmit, onCancel }: Readonly<CouponFormProps>) {
  const typeId = useId();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

  const set = (key: keyof FormState) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const bind = (key: keyof FormState) => ({
    value: form[key],
    onChange: (event: { target: { value: string } }) => set(key)(event.target.value),
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const maxDiscount = form.type === 'percent' ? toNumber(form.maxDiscount) : undefined;
    const usageLimit = toNumber(form.usageLimit);
    const startsAt = toIso(form.startsAt);
    const expiresAt = toIso(form.expiresAt);
    onSubmit({
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: Number(form.value),
      minOrderValue: Number(form.minOrderValue),
      perUserLimit: Number(form.perUserLimit),
      isActive: true,
      ...(form.description.trim() && { description: form.description.trim() }),
      ...(maxDiscount !== undefined && { maxDiscount }),
      ...(usageLimit !== undefined && { usageLimit }),
      ...(startsAt && { startsAt }),
      ...(expiresAt && { expiresAt }),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mb-8 grid gap-4 rounded-xl border border-ink bg-white p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4"
    >
      <TextField
        label="Code"
        autoComplete="off"
        placeholder="WELCOME10"
        error={errors.code}
        {...bind('code')}
        className="lg:col-span-2"
      />
      <div>
        <label htmlFor={typeId} className={labelClasses}>
          Discount type
        </label>
        <select
          id={typeId}
          className={`h-10 ${fieldClasses(false)}`}
          value={form.type}
          onChange={(event) => set('type')(event.target.value)}
        >
          <option value="percent">Percentage off</option>
          <option value="fixed">Fixed amount off</option>
        </select>
      </div>
      <TextField
        label={form.type === 'percent' ? 'Percent off' : 'Rupees off'}
        inputMode="decimal"
        error={errors.value}
        {...bind('value')}
      />
      {form.type === 'percent' && (
        <TextField
          label="Cap per order (₹, optional)"
          inputMode="decimal"
          error={errors.maxDiscount}
          {...bind('maxDiscount')}
        />
      )}
      <TextField
        label="Minimum items total (₹)"
        inputMode="decimal"
        error={errors.minOrderValue}
        {...bind('minOrderValue')}
      />
      <TextField
        label="Uses per customer"
        inputMode="numeric"
        error={errors.perUserLimit}
        {...bind('perUserLimit')}
      />
      <TextField
        label="Total uses (blank = unlimited)"
        inputMode="numeric"
        error={errors.usageLimit}
        {...bind('usageLimit')}
      />
      <TextField label="Starts (optional)" type="datetime-local" {...bind('startsAt')} />
      <TextField
        label="Expires (optional)"
        type="datetime-local"
        error={errors.expiresAt}
        {...bind('expiresAt')}
      />
      <TextField
        label="Note for yourself (optional)"
        maxLength={200}
        {...bind('description')}
        className="sm:col-span-2"
      />
      <div className="flex gap-3 sm:col-span-2 lg:col-span-4">
        <Button type="submit" isLoading={isSubmitting}>
          Create coupon
        </Button>
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
