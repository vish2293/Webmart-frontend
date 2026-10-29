import { useState } from 'react';
import { Trash2, Users } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageHeading } from '@/components/ui/PageHeading';
import { useAuth } from '@/features/auth';
import { getErrorMessage } from '@/lib/httpClient';
import type { AdminUser } from '../api/usersApi';
import { useDeleteUser, useUsers } from '../hooks/useUsers';

const headerCell = 'px-4 py-2.5 text-left text-xs font-medium text-graphite';

export default function ManageUsersPage() {
  const { user: currentUser } = useAuth();
  const usersQuery = useUsers();
  const deleteUser = useDeleteUser();
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  const renderContent = () => {
    if (usersQuery.isPending) return <LoadingState label="Loading users…" />;
    if (usersQuery.isError) {
      return (
        <ErrorState
          message={getErrorMessage(usersQuery.error)}
          onRetry={() => usersQuery.refetch()}
        />
      );
    }
    if (usersQuery.data.length === 0) {
      return <EmptyState icon={<Users size={28} aria-hidden />} title="No users found." />;
    }
    return (
      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full min-w-[600px] divide-y divide-line text-sm">
          <thead className="bg-mist">
            <tr>
              <th scope="col" className={headerCell}>
                Name
              </th>
              <th scope="col" className={headerCell}>
                Email
              </th>
              <th scope="col" className={headerCell}>
                Role
              </th>
              <th scope="col" className={`${headerCell} text-right`}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {usersQuery.data.map((account) => (
              <tr key={account._id} className="hover:bg-mist/60">
                <td className="px-4 py-3 font-medium">{account.name}</td>
                <td className="px-4 py-3">
                  <a
                    href={`mailto:${account.email}`}
                    className="text-ink decoration-brand-400 decoration-2 underline-offset-4 hover:underline"
                  >
                    {account.email}
                  </a>
                </td>
                <td className="px-4 py-3 capitalize">{account.role}</td>
                <td className="px-4 py-3 text-right">
                  {account._id === currentUser?._id ? (
                    <span className="text-xs text-graphite">You</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setUserToDelete(account)}
                      className="rounded-full p-2 text-red-600 hover:bg-red-50"
                      aria-label={`Delete ${account.name}`}
                    >
                      <Trash2 size={18} aria-hidden />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container pt-8 sm:pt-10">
      <PageHeading>Manage users</PageHeading>
      {deleteUser.isError && (
        <Alert variant="error" className="mb-6">
          {getErrorMessage(deleteUser.error, 'Failed to delete user.')}
        </Alert>
      )}
      {renderContent()}
      <ConfirmDialog
        isOpen={userToDelete !== null}
        title="Delete user?"
        description={`${userToDelete?.name ?? 'This user'} (${userToDelete?.email ?? ''}) will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete user"
        confirmVariant="danger"
        isConfirming={deleteUser.isPending}
        onCancel={() => setUserToDelete(null)}
        onConfirm={() => {
          if (!userToDelete) return;
          deleteUser.mutate(userToDelete._id, { onSettled: () => setUserToDelete(null) });
        }}
      />
    </div>
  );
}
