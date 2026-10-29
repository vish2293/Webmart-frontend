import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { Button } from '@/components/ui/Button';
import { FormCard } from '@/components/ui/FormCard';
import { TextField } from '@/components/ui/TextField';
import { ApiError, getErrorMessage } from '@/lib/httpClient';
import * as authApi from '../api/authApi';
import { useAuth } from '../hooks/useAuth';
import { minPasswordLength } from '../utils/validation';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();
  const { replaceSession } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLinkInvalid, setIsLinkInvalid] = useState(!/^[a-f0-9]{64}$/.test(token));
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLinkInvalid) {
    return (
      <FormCard
        title="This link has expired"
        footer={
          <Link
            to="/forgot-password"
            className="font-semibold text-ink underline underline-offset-4"
          >
            Request a new link
          </Link>
        }
      >
        <p className="text-sm text-graphite">
          Reset links work for 60 minutes and only once. Request a new one to choose a new password.
        </p>
      </FormCard>
    );
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < minPasswordLength) {
      setError(`Password must be at least ${minPasswordLength} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      // The server signs the customer in, since they just proved they own the mailbox.
      replaceSession(await authApi.resetPassword(token, password));
      navigate('/', { replace: true });
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.code === 'RESET_TOKEN_INVALID') {
        setIsLinkInvalid(true);
      } else {
        setError(getErrorMessage(submitError, 'Could not reset your password.'));
      }
      setIsSubmitting(false);
    }
  };

  return (
    <FormCard title="Choose a new password" description="You'll be logged in once it's saved.">
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <TextField
          label="New password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <TextField
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />
        <Button
          type="submit"
          className="w-full"
          isLoading={isSubmitting}
          disabled={!password || !confirmPassword}
          icon={<KeyRound size={18} aria-hidden />}
        >
          {isSubmitting ? 'Saving…' : 'Save new password'}
        </Button>
      </form>
    </FormCard>
  );
}
