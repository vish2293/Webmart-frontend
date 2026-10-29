import type { Session } from '@/types/session';

export type LoginInput = { email: string; password: string };
export type RegisterInput = { name: string; email: string; password: string };
export type ProfileUpdateInput = { name: string; email: string; password?: string };

export type UserProfile = Omit<Session, 'token'>;
