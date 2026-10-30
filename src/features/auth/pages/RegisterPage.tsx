import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { getErrorMessage } from '@/lib/httpClient';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import { getRedirectTarget } from '../utils/redirect';
import {
  hasErrors,
  minPasswordLength,
  validateAccountForm,
  type FieldErrors,
} from '../utils/validation';

const emptyForm = { name: '', email: '', password: '', confirmPassword: '' };
type RegisterField = keyof typeof emptyForm;

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = getRedirectTarget(location.state);

  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<RegisterField>>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated && !isSubmitting) return <Navigate to={redirectTo} replace />;

  const updateField = (field: RegisterField) => (value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitError('');

    const errors = validateAccountForm(form);
    setFieldErrors(errors);
    if (hasErrors(errors)) return;

    setIsSubmitting(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Registration failed. Please try again.'));
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            state={location.state}
            className="font-semibold text-ink decoration-brand-400 decoration-2 underline-offset-4 hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      {submitError && (
        <Alert variant="error" className="mb-4">
          {submitError}
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <TextField
          label="Full name"
          autoComplete="name"
          value={form.name}
          onChange={(event) => updateField('name')(event.target.value)}
          error={fieldErrors.name}
          required
        />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(event) => updateField('email')(event.target.value)}
          error={fieldErrors.email}
          required
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          minLength={minPasswordLength}
          value={form.password}
          onChange={(event) => updateField('password')(event.target.value)}
          error={fieldErrors.password}
          required
        />
        <TextField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={(event) => updateField('confirmPassword')(event.target.value)}
          error={fieldErrors.confirmPassword}
          required
        />
        <Button
          type="submit"
          className="w-full"
          isLoading={isSubmitting}
          icon={<UserPlus size={18} aria-hidden />}
        >
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  );
}
