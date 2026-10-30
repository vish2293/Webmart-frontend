import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { getErrorMessage } from '@/lib/httpClient';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import { getRedirectTarget } from '../utils/redirect';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = getRedirectTarget(location.state);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated && !isSubmitting) return <Navigate to={redirectTo} replace />;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Login failed. Please check your credentials.'));
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Log in"
      footer={
        <>
          New customer?{' '}
          <Link
            to="/register"
            state={location.state}
            className="font-semibold text-ink decoration-brand-400 decoration-2 underline-offset-4 hover:underline"
          >
            Create an account
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
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <p className="text-right text-[13px]">
          <Link
            to="/forgot-password"
            className="text-graphite underline underline-offset-2 hover:text-ink"
          >
            Forgot password?
          </Link>
        </p>
        <Button
          type="submit"
          className="w-full"
          isLoading={isSubmitting}
          disabled={!email || !password}
          icon={<LogIn size={18} aria-hidden />}
        >
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
    </AuthLayout>
  );
}
