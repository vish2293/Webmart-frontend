import { Link } from 'react-router-dom';
import {
  BarChart2,
  ChevronRight,
  Crown,
  Package,
  ShoppingBag,
  Tag,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { PageHeading } from '@/components/ui/PageHeading';

const adminSections: { to: string; title: string; description: string; Icon: LucideIcon }[] = [
  {
    to: '/admin/orders',
    title: 'Orders',
    description: 'Confirm payments and mark orders as delivered.',
    Icon: ShoppingBag,
  },
  {
    to: '/admin/memberships',
    title: 'Memberships',
    description: 'See Plus members and refund memberships.',
    Icon: Crown,
  },
  {
    to: '/admin/coupons',
    title: 'Coupons',
    description: 'Create discount codes and see how they are used.',
    Icon: Tag,
  },
  {
    to: '/admin/products',
    title: 'Products',
    description: 'Add products, update prices and manage stock.',
    Icon: Package,
  },
  {
    to: '/admin/users',
    title: 'Customers',
    description: 'View and remove customer accounts.',
    Icon: Users,
  },
  {
    to: '/admin/reports',
    title: 'Sales',
    description: 'Revenue, order volume and deliveries due.',
    Icon: BarChart2,
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="container pt-8 sm:pt-10">
      <PageHeading description="Manage the store">Admin</PageHeading>
      <ul className="grid gap-3 sm:grid-cols-2">
        {adminSections.map(({ to, title, description, Icon }) => (
          <li key={to}>
            <Link
              to={to}
              className="group flex items-center gap-4 rounded-xl border border-line p-5 transition-colors hover:border-ink"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-mist text-ink transition-colors group-hover:bg-brand-400">
                <Icon size={18} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-ink">{title}</span>
                <span className="mt-0.5 block text-[13px] text-graphite">{description}</span>
              </span>
              <ChevronRight size={18} className="shrink-0 text-zinc-400" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
