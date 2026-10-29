import { useEffect, useId, useRef } from 'react';
import { Button } from './Button';
import type { ButtonVariant } from './buttonStyles';

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant?: ButtonVariant;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Native <dialog> gives focus trapping, Esc-to-close and a modal role for free. */
export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  confirmVariant = 'primary',
  isConfirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        if (!isConfirming) onCancel();
      }}
      aria-labelledby={titleId}
      className="w-full max-w-sm rounded-xl p-6 shadow-xl backdrop:bg-slate-900/60"
    >
      <h2 id={titleId} className="mb-2 text-lg font-semibold text-ink">
        {title}
      </h2>
      <p className="mb-6 text-slate-600">{description}</p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" size="sm" onClick={onCancel} disabled={isConfirming}>
          Cancel
        </Button>
        <Button variant={confirmVariant} size="sm" onClick={onConfirm} isLoading={isConfirming}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
