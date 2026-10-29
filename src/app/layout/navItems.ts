import { Home, ListOrdered, Settings, Store, type LucideIcon } from 'lucide-react';

export type NavItem = {
  to: string;
  label: string;
  Icon: LucideIcon;
  access: 'public' | 'user' | 'admin';
};

export const navItems: NavItem[] = [
  { to: '/', label: 'Home', Icon: Home, access: 'public' },
  { to: '/products', label: 'Shop', Icon: Store, access: 'public' },
  { to: '/orders', label: 'Orders', Icon: ListOrdered, access: 'user' },
  { to: '/admin', label: 'Admin', Icon: Settings, access: 'admin' },
];

export function visibleNavItems({
  isAuthenticated,
  isAdmin,
}: {
  isAuthenticated: boolean;
  isAdmin: boolean;
}) {
  return navItems.filter(
    (item) =>
      item.access === 'public' ||
      (item.access === 'user' && isAuthenticated) ||
      (item.access === 'admin' && isAdmin),
  );
}
