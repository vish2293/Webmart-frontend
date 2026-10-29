import { httpClient } from '@/lib/httpClient';
import type { AddressInput, SavedAddress } from '../types';

const addressPath = (id: string) => `/users/addresses/${encodeURIComponent(id)}`;

// Every call returns the whole updated address book.
export const getAddresses = (signal?: AbortSignal) =>
  httpClient.get<SavedAddress[]>('/users/addresses', signal);

export const addAddress = (input: AddressInput) =>
  httpClient.post<SavedAddress[]>('/users/addresses', input);

export const updateAddress = ({ id, input }: { id: string; input: AddressInput }) =>
  httpClient.put<SavedAddress[]>(addressPath(id), input);

export const setDefaultAddress = (id: string) =>
  httpClient.put<SavedAddress[]>(`${addressPath(id)}/default`);

export const deleteAddress = (id: string) => httpClient.delete<SavedAddress[]>(addressPath(id));
