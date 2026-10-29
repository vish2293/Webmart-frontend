export type UserRole = 'user' | 'admin';

/** Authenticated user as returned by POST /users/login and /users/register. */
export type Session = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
};
