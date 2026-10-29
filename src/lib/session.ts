import type { Session } from '@/types/session';
import { readJson, removeKey, writeJson } from './storage';

// ponytail: JWT in localStorage is readable by any script on this origin. Move to an
// httpOnly cookie on the server if the threat model requires it.
const sessionKey = 'userInfo';
export const sessionExpiredEvent = 'session:expired';

export const getSession = (): Session | null => readJson<Session | null>(sessionKey, null);
export const saveSession = (session: Session): void => writeJson(sessionKey, session);
export const clearSession = (): void => removeKey(sessionKey);
