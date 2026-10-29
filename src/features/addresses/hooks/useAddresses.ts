import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as addressesApi from '../api/addressesApi';
import type { SavedAddress } from '../types';

export const addressKeys = { all: ['addresses'] as const };

export function useAddresses({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: addressKeys.all,
    queryFn: ({ signal }) => addressesApi.getAddresses(signal),
    enabled,
  });
}

/** The server returns the full updated list, so the cache is replaced rather than refetched. */
function useAddressMutation<TInput>(mutationFn: (input: TInput) => Promise<SavedAddress[]>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (addresses) => queryClient.setQueryData(addressKeys.all, addresses),
  });
}

export const useAddAddress = () => useAddressMutation(addressesApi.addAddress);
export const useUpdateAddress = () => useAddressMutation(addressesApi.updateAddress);
export const useSetDefaultAddress = () => useAddressMutation(addressesApi.setDefaultAddress);
export const useDeleteAddress = () => useAddressMutation(addressesApi.deleteAddress);
