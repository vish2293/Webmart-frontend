import { useState, type FormEvent } from 'react';
import { PlusCircle, Save, X } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { Button } from '@/components/ui/Button';
import { TextAreaField } from '@/components/ui/TextAreaField';
import { TextField } from '@/components/ui/TextField';
import type { Product, ProductInput } from '@/features/products';

type ProductFormValues = Record<keyof ProductInput, string>;
type ProductFormErrors = Partial<Record<keyof ProductInput, string>>;

const toFormValues = (product?: Product): ProductFormValues => ({
  name: product?.name ?? '',
  description: product?.description ?? '',
  price: product ? String(product.price) : '',
  imageUrl: product?.imageUrl ?? '',
  category: product?.category ?? '',
  countInStock: product ? String(product.countInStock) : '',
});

const isHttpUrl = (value: string) => {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

function validate(values: ProductFormValues): ProductFormErrors {
  const errors: ProductFormErrors = {};
  if (!values.name.trim()) errors.name = 'Name is required.';
  if (!values.description.trim()) errors.description = 'Description is required.';
  if (!values.category.trim()) errors.category = 'Category is required.';
  if (!isHttpUrl(values.imageUrl.trim())) errors.imageUrl = 'Enter a valid http(s) image URL.';

  const price = Number(values.price);
  if (values.price === '' || !Number.isFinite(price) || price < 0) {
    errors.price = 'Enter a price of 0 or more.';
  }
  const stock = Number(values.countInStock);
  if (values.countInStock === '' || !Number.isInteger(stock) || stock < 0) {
    errors.countInStock = 'Enter a whole number of 0 or more.';
  }
  return errors;
}

type ProductFormProps = {
  /** Present when editing; absent when creating. */
  product?: Product;
  isSaving: boolean;
  submitError?: string;
  onSubmit: (input: ProductInput) => void;
  onCancel: () => void;
};

export function ProductForm({
  product,
  isSaving,
  submitError,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [values, setValues] = useState(() => toFormValues(product));
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const isEditing = Boolean(product);

  const bindField = (field: keyof ProductInput) => ({
    value: values[field],
    error: errors[field],
    onChange: (event: { target: { value: string } }) =>
      setValues((current) => ({ ...current, [field]: event.target.value })),
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      name: values.name.trim(),
      description: values.description.trim(),
      price: Number(values.price),
      imageUrl: values.imageUrl.trim(),
      category: values.category.trim(),
      countInStock: Number(values.countInStock),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <h2 className="text-lg font-semibold text-ink">
        {isEditing ? 'Edit product' : 'New product'}
      </h2>
      {submitError && <Alert variant="error">{submitError}</Alert>}
      <TextField label="Product name" required {...bindField('name')} />
      <TextAreaField label="Description" rows={3} required {...bindField('description')} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField
          label="Price (₹)"
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          required
          {...bindField('price')}
        />
        <TextField label="Image URL" type="url" required {...bindField('imageUrl')} />
        <TextField label="Category" required {...bindField('category')} />
        <TextField
          label="Count in stock"
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          required
          {...bindField('countInStock')}
        />
      </div>
      <div className="flex flex-col justify-end gap-3 sm:flex-row">
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={isSaving}
          icon={<X size={18} aria-hidden />}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="success"
          isLoading={isSaving}
          icon={isEditing ? <Save size={18} aria-hidden /> : <PlusCircle size={18} aria-hidden />}
        >
          {isEditing ? 'Save changes' : 'Add product'}
        </Button>
      </div>
    </form>
  );
}
