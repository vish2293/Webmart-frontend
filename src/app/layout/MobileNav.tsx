import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { LogIn, LogOut, User, UserPlus, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/features/auth';
import { visibleNavItems } from './navItems';

type MobileNavProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Asks the layout to confirm before logging out. */
  onRequestLogout: () => void;
};

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors ${
    isActive ? 'bg-brand-400 text-ink' : 'text-zinc-300 hover:bg-ink-700 hover:text-white'
  }`;

/** Slide-in drawer built on native <dialog> for focus trapping and Esc handling. */
export function MobileNav({ isOpen, onClose, onRequestLogout }: MobileNavProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { user, isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    // Backdrop click is a mouse convenience; keyboard users close via Esc (onCancel) or the X button.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialogRef}
      aria-label="Menu"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // Clicking the backdrop (the dialog element itself) closes the drawer.
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-0 h-full max-h-full w-72 max-w-[85vw] bg-ink p-0 text-white shadow-xl backdrop:bg-black/60 md:hidden"
    >
      <div className="flex items-center justify-between border-b border-ink-700 p-4">
        <Logo tone="light" className="h-5 w-auto" />
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 hover:bg-ink-700"
          aria-label="Close menu"
        >
          <X size={20} aria-hidden />
        </button>
      </div>

      {user && (
        <div className="flex items-center gap-3 border-b border-ink-700 p-4">
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 text-sm items-center justify-center rounded-full bg-brand-400 font-bold text-ink"
          >
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium">{user.name}</p>
            <p className="truncate text-sm text-slate-400">{user.email}</p>
          </div>
        </div>
      )}

      <nav aria-label="Mobile" className="flex flex-col gap-1 p-4">
        {visibleNavItems({ isAuthenticated, isAdmin }).map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className={linkClasses} onClick={onClose}>
            <Icon size={18} aria-hidden />
            {label}
          </NavLink>
        ))}
        <hr className="my-2 border-ink-700" />
        {isAuthenticated ? (
          <>
            <NavLink to="/profile" className={linkClasses} onClick={onClose}>
              <User size={18} aria-hidden />
              Profile
            </NavLink>
            <button
              type="button"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[15px] font-medium text-zinc-300 hover:text-white hover:bg-ink-700"
              onClick={() => {
                onClose();
                onRequestLogout();
              }}
            >
              <LogOut size={20} aria-hidden />
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={linkClasses} onClick={onClose}>
              <LogIn size={20} aria-hidden />
              Log in
            </NavLink>
            <NavLink to="/register" className={linkClasses} onClick={onClose}>
              <UserPlus size={20} aria-hidden />
              Create account
            </NavLink>
          </>
        )}
      </nav>
    </dialog>
  );
}
