import { useState, type FormEvent } from 'react';
import { Pencil, Save, X } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/TextField';
import { getErrorMessage } from '@/lib/httpClient';
import type { Session } from '@/types/session';
import * as authApi from '../api/authApi';
import { AddressBook } from '@/features/addresses';
import { PointsCard } from '@/features/rewards';
import { useAuth } from '../hooks/useAuth';
import { hasErrors, validateAccountForm, type FieldErrors } from '../utils/validation';

type ProfileField = 'name' | 'email' | 'password' | 'confirmPassword';

const formFromUser = (user: Pick<Session, 'name' | 'email'>) => ({
  name: user.name,
  email: user.email,
  password: '',
  confirmPassword: '',
});

/** "Vansh Patel" → "VP"; a single name gives one letter. */
const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

export default function ProfilePage() {
  const { user } = useAuth();
  // The route guard redirects guests; this only covers the instant after logout.
  if (!user) return null;
  return (
    <div className="container grid items-start gap-6 py-8 sm:py-12 lg:grid-cols-[380px_1fr]">
      <ProfileForm currentUser={user} />
      <div className="space-y-6">
        <AddressBook />
        <PointsCard />
      </div>
    </div>
  );
}

function ProfileForm({ currentUser }: { currentUser: Session }) {
  const { replaceSession } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(() => formFromUser(currentUser));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<ProfileField>>({});
  const [status, setStatus] = useState<{ variant: 'success' | 'error'; message: string } | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (field: ProfileField) => (value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleCancel = () => {
    setIsEditing(false);
    setForm(formFromUser(currentUser));
    setFieldErrors({});
    setStatus(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus(null);

    const errors = validateAccountForm(form, { isPasswordOptional: true });
    setFieldErrors(errors);
    if (hasErrors(errors)) return;

    const name = form.name.trim();
    const email = form.email.trim();
    if (name === currentUser.name && email === currentUser.email && !form.password) {
      setStatus({ variant: 'error', message: 'No changes to save.' });
      return;
    }

    setIsSaving(true);
    try {
      const session = await authApi.updateProfile({
        name,
        email,
        ...(form.password ? { password: form.password } : {}),
      });
      replaceSession(session);
      setForm(formFromUser(session));
      setIsEditing(false);
      setStatus({ variant: 'success', message: 'Profile updated successfully.' });
    } catch (error) {
      setStatus({ variant: 'error', message: getErrorMessage(error, 'Failed to update profile.') });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card aria-labelledby="profile-heading" className="lg:sticky lg:top-24">
      <div className="flex items-center gap-4">
        <span
          aria-hidden
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-400 text-xl font-bold text-ink"
        >
          {getInitials(currentUser.name)}
        </span>
        <div className="min-w-0 flex-1">
          <h1 id="profile-heading" className="truncate text-xl font-bold tracking-display text-ink">
            {currentUser.name}
          </h1>
          <p className="truncate text-sm text-graphite">{currentUser.email}</p>
        </div>
      </div>

      <div className="mb-4 mt-6 flex items-center justify-between gap-3 border-t border-line pt-6">
        <h2 className="text-base font-semibold text-ink">Account details</h2>
      </div>
      {status && (
        <Alert variant={status.variant} className="mb-4">
          {status.message}
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <TextField
          label="Full name"
          autoComplete="name"
          value={form.name}
          onChange={(event) => updateField('name')(event.target.value)}
          readOnly={!isEditing}
          error={fieldErrors.name}
        />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(event) => updateField('email')(event.target.value)}
          readOnly={!isEditing}
          error={fieldErrors.email}
        />
        {/* Always mounted so the password fields can slide open (0fr → 1fr) instead of popping in;
            disabled while closed keeps them out of the tab order. */}
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
            isEditing ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="space-y-4 p-0.5">
              <TextField
                label="New password (optional)"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(event) => updateField('password')(event.target.value)}
                error={fieldErrors.password}
                disabled={!isEditing}
              />
              <TextField
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(event) => updateField('confirmPassword')(event.target.value)}
                error={fieldErrors.confirmPassword}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-end gap-3 pt-2 sm:flex-row">
          {isEditing ? (
            <>
              <Button
                variant="secondary"
                onClick={handleCancel}
                disabled={isSaving}
                icon={<X size={18} aria-hidden />}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="success"
                isLoading={isSaving}
                icon={<Save size={18} aria-hidden />}
              >
                {isSaving ? 'Saving…' : 'Save changes'}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => {
                setStatus(null);
                setIsEditing(true);
              }}
              icon={<Pencil size={18} aria-hidden />}
            >
              Edit profile
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
