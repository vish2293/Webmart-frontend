// Client-side checks for fast feedback only; the server remains the authority.
export const minPasswordLength = 6;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: string) => emailPattern.test(email.trim());

export type FieldErrors<T extends string> = Partial<Record<T, string>>;

type AccountFields = { name: string; email: string; password: string; confirmPassword: string };

/**
 * Shared by registration and profile edit. `isPasswordOptional` allows leaving the
 * password blank on profile edit to keep the current one.
 */
export function validateAccountForm(
  values: AccountFields,
  { isPasswordOptional = false } = {},
): FieldErrors<keyof AccountFields> {
  const errors: FieldErrors<keyof AccountFields> = {};

  if (!values.name.trim()) errors.name = 'Name is required.';
  if (!isValidEmail(values.email)) errors.email = 'Enter a valid email address.';

  const isPasswordRequired = !isPasswordOptional || values.password.length > 0;
  if (isPasswordRequired && values.password.length < minPasswordLength) {
    errors.password = `Password must be at least ${minPasswordLength} characters.`;
  }
  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}

export const hasErrors = (errors: object) => Object.keys(errors).length > 0;
