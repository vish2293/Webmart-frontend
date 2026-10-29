import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as usersApi from '../api/usersApi';

const userKeys = { all: ['users'] as const };

export function useUsers() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: ({ signal }) => usersApi.getUsers(signal),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}
