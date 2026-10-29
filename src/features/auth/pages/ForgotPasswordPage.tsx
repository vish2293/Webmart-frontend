import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { Button } from '@/components/ui/Button';
import { FormCard } from '@/components/ui/FormCard';
import { TextField } from '@/components/ui/TextField';
import { getErrorMessage } from '@/lib/httpClient';
import * as authApi from '../api/authApi';
import { isValidEmail } from '../utils/validation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await authApi.forgotPassword(email.trim());
      setSentTo(email.trim());
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Could not send the reset link. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const loginLink = (
    <Link
      to="/login"
      className="font-semibold text-ink decoration-brand-400 decoration-2 underline-offset-4 hover:underline"
    >
      Back to log in
    </Link>
  );

  if (sentTo) {
    return (
      <FormCard title="Check your email" footer={loginLink}>
        <Alert variant="success">
          If {sentTo} has an account, we&apos;ve sent a link to reset the password. It works for 60
          minutes.
        </Alert>
        <p className="mt-4 text-sm text-graphite">
          Nothing in your inbox? Check spam, or{' '}
          <button
            type="button"
            onClick={() => setSentTo('')}
            className="font-semibold text-ink underline underline-offset-2"
          >
            try a different address
          </button>
          .
        </p>
      </FormCard>
    );
  }

  return (
    <FormCard
      title="Forgot your password?"
      description="Enter your email and we'll send you a link to choose a new one."
      footer={loginLink}
    >
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Button
          type="submit"
          className="w-full"
          isLoading={isSubmitting}
          disabled={!email}
          icon={<Mail size={18} aria-hidden />}
        >
          {isSubmitting ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>
    </FormCard>
  );
}
