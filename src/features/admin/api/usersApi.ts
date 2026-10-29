import { httpClient } from '@/lib/httpClient';
import type { UserRole } from '@/types/session';

export type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
};

export const getUsers = (signal?: AbortSignal) => httpClient.get<AdminUser[]>('/users', signal);

export const deleteUser = (userId: string) =>
  httpClient.delete<{ message: string }>(`/users/${encodeURIComponent(userId)}`);
