import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { clearSession, getSession, saveSession, sessionExpiredEvent } from '@/lib/session';
import type { Session } from '@/types/session';
import * as authApi from '../api/authApi';
import { AuthContext, type AuthContextValue } from './authContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<Session | null>(getSession);

  const replaceSession = useCallback((session: Session) => {
    saveSession(session);
    setUser(session);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    // Drop cached data so the next user never sees the previous user's orders.
    queryClient.clear();
  }, [queryClient]);

  // httpClient clears the session on any 401; mirror that in React state.
  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      queryClient.clear();
    };
    window.addEventListener(sessionExpiredEvent, handleExpired);
    return () => window.removeEventListener(sessionExpiredEvent, handleExpired);
  }, [queryClient]);

  // Validate a restored token once on startup; a 401 triggers the expiry handler above.
  useEffect(() => {
    if (!getSession()) return;
    const controller = new AbortController();
    authApi.getProfile(controller.signal).catch(() => {
      // 401 is handled by httpClient; other failures (offline) keep the session.
    });
    return () => controller.abort();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isAdmin: user?.role === 'admin',
      login: async (input) => {
        const session = await authApi.login(input);
        replaceSession(session);
        return session;
      },
      register: async (input) => {
        const session = await authApi.register(input);
        replaceSession(session);
        return session;
      },
      logout,
      replaceSession,
    }),
    [user, logout, replaceSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
