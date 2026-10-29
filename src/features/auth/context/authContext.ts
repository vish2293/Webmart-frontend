import { createContext } from 'react';
import type { Session } from '@/types/session';
import type { LoginInput, RegisterInput } from '../types';

export type AuthContextValue = {
  user: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (input: LoginInput) => Promise<Session>;
  register: (input: RegisterInput) => Promise<Session>;
  logout: () => void;
  /** Replace the stored session, e.g. after a profile update returns a new token. */
  replaceSession: (session: Session) => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
