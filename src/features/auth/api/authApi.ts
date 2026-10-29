import { httpClient } from '@/lib/httpClient';
import type { Session } from '@/types/session';
import type { LoginInput, ProfileUpdateInput, RegisterInput, UserProfile } from '../types';

export const login = (input: LoginInput) => httpClient.post<Session>('/users/login', input);

export const register = (input: RegisterInput) =>
  httpClient.post<Session>('/users/register', input);

export const getProfile = (signal?: AbortSignal) =>
  httpClient.get<UserProfile>('/users/profile', signal);

/** The server issues a fresh token on profile update. */
export const updateProfile = (input: ProfileUpdateInput) =>
  httpClient.put<Session>('/users/profile', input);
