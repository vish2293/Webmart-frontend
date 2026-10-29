import { useState, type FormEvent } from 'react';
import { Pencil, Save, X } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { getErrorMessage } from '@/lib/httpClient';
import type { Session } from '@/types/session';
import * as authApi from '../api/authApi';
import { FormCard } from '@/components/ui/FormCard';
import { useAuth } from '../hooks/useAuth';
import { hasErrors, validateAccountForm, type FieldErrors } from '../utils/validation';

type ProfileField = 'name' | 'email' | 'password' | 'confirmPassword';

const formFromUser = (user: Pick<Session, 'name' | 'email'>) => ({
  name: user.name,
  email: user.email,
  password: '',
  confirmPassword: '',
});

export default function ProfilePage() {
  const { user } = useAuth();
  // The route guard redirects guests; this only covers the instant after logout.
  if (!user) return null;
  return <ProfileForm currentUser={user} />;
}

function ProfileForm({ currentUser }: { currentUser: Session }) {
  const { replaceSession, logout } = useAuth();

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
    <FormCard
      title="Your profile"
      footer={
        <Button variant="ghost" onClick={logout} className="text-red-600 hover:bg-red-50">
          Log out
        </Button>
      }
    >
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
        {isEditing && (
          <>
            <TextField
              label="New password (optional)"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => updateField('password')(event.target.value)}
              error={fieldErrors.password}
            />
            <TextField
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(event) => updateField('confirmPassword')(event.target.value)}
              error={fieldErrors.confirmPassword}
            />
          </>
        )}

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
    </FormCard>
  );
}
