import { useState } from 'react';
import { MapPin, Plus } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { getErrorMessage } from '@/lib/httpClient';
import {
  useAddAddress,
  useAddresses,
  useDeleteAddress,
  useSetDefaultAddress,
  useUpdateAddress,
} from '../hooks/useAddresses';
import { maxSavedAddresses, type SavedAddress } from '../types';
import { AddressForm } from './AddressForm';

const linkButton =
  'text-[13px] font-medium text-graphite underline underline-offset-2 hover:text-ink disabled:opacity-40';

/** Profile card: list, add, edit, delete and choose the default delivery address. */
export function AddressBook() {
  const addresses = useAddresses();
  const addAddress = useAddAddress();
  const updateAddress = useUpdateAddress();
  const setDefault = useSetDefaultAddress();
  const deleteAddress = useDeleteAddress();
  // 'new' while adding; an address id while editing; null when just browsing.
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [toDelete, setToDelete] = useState<SavedAddress | null>(null);

  const error = [addAddress, updateAddress, setDefault, deleteAddress].find(
    (mutation) => mutation.isError,
  )?.error;
  const list = addresses.data ?? [];
  const isBusy = setDefault.isPending || deleteAddress.isPending;

  return (
    <Card aria-labelledby="addresses-heading">
      <div className="flex items-center justify-between gap-3">
        <h2
          id="addresses-heading"
          className="flex items-center gap-2 text-lg font-semibold text-ink"
        >
          <MapPin size={20} aria-hidden /> Saved addresses
        </h2>
        {editing === null && list.length < maxSavedAddresses && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setEditing('new')}
            icon={<Plus size={14} aria-hidden />}
          >
            Add
          </Button>
        )}
      </div>

      {addresses.isPending && <p className="mt-3 text-sm text-graphite">Loading your addresses…</p>}
      {addresses.isError && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {getErrorMessage(addresses.error, 'Could not load your addresses.')}
        </p>
      )}
      {error && (
        <Alert variant="error" className="mt-3">
          {getErrorMessage(error)}
        </Alert>
      )}

      {editing === 'new' && (
        <div className="mt-4 rounded-lg border border-ink p-4 sm:p-5">
          <AddressForm
            submitLabel="Save address"
            isSubmitting={addAddress.isPending}
            onCancel={() => setEditing(null)}
            onSubmit={(input) => addAddress.mutate(input, { onSuccess: () => setEditing(null) })}
          />
        </div>
      )}

      {addresses.isSuccess && list.length === 0 && editing !== 'new' && (
        <p className="mt-3 text-sm text-graphite">
          No saved addresses yet. Add one and checkout fills it in for you.
        </p>
      )}

      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {list.map((saved) => (
          <li
            key={saved._id}
            // The edit form needs the whole row; a saved address only needs its own cell.
            className={`rounded-lg border p-4 text-sm ${
              editing === saved._id ? 'border-ink md:col-span-2' : 'border-line'
            }`}
          >
            {editing === saved._id ? (
              <AddressForm
                initial={saved}
                submitLabel="Save changes"
                isSubmitting={updateAddress.isPending}
                onCancel={() => setEditing(null)}
                onSubmit={(input) =>
                  updateAddress.mutate(
                    { id: saved._id, input },
                    { onSuccess: () => setEditing(null) },
                  )
                }
              />
            ) : (
              <>
                <p className="flex items-center gap-2 font-semibold text-ink">
                  {saved.label}
                  {saved.isDefault && (
                    <span className="rounded-full bg-brand-400 px-2 py-0.5 text-[11px] font-semibold">
                      Default
                    </span>
                  )}
                </p>
                <p className="mt-1 text-graphite">
                  {saved.address}, {saved.city}, {saved.postalCode}, {saved.country}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                  <button
                    type="button"
                    className={linkButton}
                    onClick={() => setEditing(saved._id)}
                    disabled={editing !== null}
                  >
                    Edit
                  </button>
                  {!saved.isDefault && (
                    <button
                      type="button"
                      className={linkButton}
                      onClick={() => setDefault.mutate(saved._id)}
                      disabled={isBusy}
                    >
                      Make default
                    </button>
                  )}
                  <button
                    type="button"
                    className={`${linkButton} hover:text-red-700`}
                    onClick={() => setToDelete(saved)}
                    disabled={isBusy}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      <ConfirmDialog
        isOpen={toDelete !== null}
        title="Delete this address?"
        description={
          toDelete
            ? `${toDelete.label}: ${toDelete.address}, ${toDelete.city} will be removed.`
            : ''
        }
        confirmLabel="Delete"
        confirmVariant="danger"
        isConfirming={deleteAddress.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() =>
          toDelete && deleteAddress.mutate(toDelete._id, { onSettled: () => setToDelete(null) })
        }
      />
    </Card>
  );
}
