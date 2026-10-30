import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Gift, PackageCheck, Sparkles } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

type AuthLayoutProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

const perks = [
  { icon: Gift, text: 'A discount on your first order' },
  { icon: Sparkles, text: 'Points on every order, spend them at checkout' },
  { icon: PackageCheck, text: 'Track every order in one place' },
];

/** Login, register and password pages: brand panel beside the form (form only on small screens). */
export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="container py-8 sm:py-12">
      <div className="mx-auto grid max-w-4xl overflow-hidden rounded-2xl border border-line bg-white lg:grid-cols-[2fr_3fr]">
        <aside className="hidden flex-col justify-between bg-ink p-8 text-white lg:flex">
          <Link to="/" aria-label="Back to the store">
            <Logo tone="light" className="h-6 w-auto" />
          </Link>
          <div>
            <p className="text-2xl font-bold leading-tight tracking-display">
              Shop smarter.
              <br />
              Get it sooner<span className="text-brand-400">.</span>
            </p>
            <ul className="mt-6 space-y-3.5 text-sm text-white/80">
              {perks.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-400 text-ink">
                    <Icon size={16} aria-hidden />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-white/50">
            Secure checkout with UPI, cards and cash on delivery.
          </p>
        </aside>

        <div className="p-6 sm:p-10">
          <Link to="/" aria-label="Back to the store" className="mb-6 inline-block lg:hidden">
            <Logo className="h-5 w-auto" />
          </Link>
          <h1 className="text-2xl font-bold tracking-display text-ink">{title}</h1>
          {description && <p className="mt-1.5 text-sm text-graphite">{description}</p>}
          <div className="mt-6">{children}</div>
          {footer && (
            <div className="mt-6 border-t border-line pt-5 text-sm text-graphite">{footer}</div>
          )}
        </div>
      </div>
    </div>
  );
}
