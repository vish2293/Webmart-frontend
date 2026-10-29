import { Link, NavLink } from 'react-router-dom';
import { LogOut, Menu, ShoppingBag, User } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/features/auth';
import { useCart } from '@/features/cart';
import { HeaderSearch } from './HeaderSearch';
import { visibleNavItems } from './navItems';

// Active link is marked with the logo's volt dot rather than a filled pill.
const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  `relative px-3 py-2 text-sm font-medium transition-colors after:absolute after:bottom-0 after:left-1/2 after:h-1.5 after:w-1.5 after:-translate-x-1/2 after:rounded-full after:bg-brand-400 after:transition-opacity ${
    isActive ? 'text-ink after:opacity-100' : 'text-graphite hover:text-ink after:opacity-0'
  }`;

const iconButtonClasses =
  'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink transition-colors hover:bg-mist';

// Separate from iconButtonClasses: combining `w-9` with `w-auto` lets `w-9` win in the
// generated CSS, squeezing the name under the logout button.
const profileLinkClasses =
  'flex h-9 max-w-[160px] shrink-0 items-center gap-2 rounded-lg px-2.5 text-ink transition-colors hover:bg-mist';

export function Header({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur-md">
      <div className="container flex h-16 items-center gap-6">
        <button
          type="button"
          className={`${iconButtonClasses} -ml-2 md:hidden`}
          onClick={onOpenMobileNav}
          aria-label="Open menu"
        >
          <Menu size={20} aria-hidden />
        </button>

        <Link to="/" className="shrink-0" aria-label="Webvoltz Store home">
          <Logo className="h-[22px] w-auto" />
        </Link>

        <nav aria-label="Main" className="hidden items-center md:flex">
          {visibleNavItems({ isAuthenticated, isAdmin }).map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'} className={navLinkClasses}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <div className="mr-2 hidden lg:block">
            <HeaderSearch />
          </div>

          <Link to="/cart" className={iconButtonClasses} aria-label={`Cart, ${itemCount} items`}>
            <ShoppingBag size={19} aria-hidden />
            {itemCount > 0 && (
              <span
                aria-hidden
                className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-400 px-1 text-[10px] font-bold leading-none text-ink"
              >
                {itemCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="hidden items-center gap-1 md:flex">
              <Link to="/profile" className={profileLinkClasses} title="Your profile">
                <User size={18} aria-hidden />
                <span className="truncate text-sm font-medium">{user?.name.split(' ')[0]}</span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className={iconButtonClasses}
                aria-label="Log out"
                title="Log out"
              >
                <LogOut size={18} aria-hidden />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="ml-2 hidden h-9 items-center rounded-lg bg-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-700 md:flex"
            >
              Log in
            </Link>
          )}
        </div>
      </div>
      <div className="container pb-3 lg:hidden">
        <HeaderSearch />
      </div>
    </header>
  );
}
