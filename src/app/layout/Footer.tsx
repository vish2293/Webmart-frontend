import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Wallet } from 'lucide-react';
import { storeInfo } from '@/app/config/store';
import { Logo } from '@/components/ui/Logo';
import { pricingRules } from '@/features/cart';
import { policyPath, policySlugs, policyTitles } from '@/features/policies/links';
import { useProductCategories } from '@/features/products';
import { formatCurrencyWhole } from '@/utils/formatCurrency';

const currentYear = new Date().getFullYear();

const linkClasses = 'text-sm text-ink/75 transition-colors hover:text-ink';
const headingClasses = 'mb-4 text-[15px] font-semibold text-ink';

// Department of Telecommunications portal for reporting fraud calls and messages.
const chakshuPortalUrl = 'https://sancharsaathi.gov.in/sfc/';

type FooterLink = { to: string; label: string };

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <nav aria-label={title}>
      <h2 className={headingClasses}>{title}</h2>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className={linkClasses}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function TrustPanel() {
  const freeShippingOver = formatCurrencyWhole(pricingRules.freeShippingThreshold);
  const points = [
    { Icon: ShieldCheck, text: 'Secure payments by UPI and card' },
    { Icon: Wallet, text: 'Cash on delivery available' },
    { Icon: Truck, text: `Free shipping on orders over ${freeShippingOver}` },
  ];

  return (
    <section aria-labelledby="footer-trust" className="rounded-xl bg-white p-5">
      <h2 id="footer-trust" className="text-lg font-bold tracking-display text-ink">
        Shop with confidence<span className="text-brand-500">.</span>
      </h2>
      <ul className="mt-4 space-y-3 text-sm text-ink/80">
        {points.map(({ Icon, text }) => (
          <li key={text} className="flex items-start gap-2.5">
            <Icon size={18} className="mt-0.5 shrink-0 text-ink" aria-hidden />
            {text}
          </li>
        ))}
      </ul>
    </section>
  );
}

function PopularSearches({ categories }: { categories: string[] }) {
  const searches: FooterLink[] = [
    ...categories.map((category) => ({
      label: category,
      to: `/products?category=${encodeURIComponent(category)}`,
    })),
    { label: 'Under ₹1,000', to: '/products?price=under-1000' },
    { label: 'In stock now', to: '/products?stock=in' },
  ];

  return (
    <nav aria-labelledby="popular-searches" className="border-t border-ink/15 py-8">
      <h2 id="popular-searches" className={headingClasses}>
        Popular searches
      </h2>
      <ul className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[15px]">
        {searches.map((search, index) => (
          <li key={search.to} className="flex items-center gap-3">
            {index > 0 && (
              <span aria-hidden className="text-ink/30">
                |
              </span>
            )}
            <Link
              to={search.to}
              className="text-ink underline decoration-ink/30 underline-offset-4 transition-colors hover:decoration-brand-500 hover:decoration-2"
            >
              {search.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function CautionNotice() {
  return (
    <section aria-labelledby="caution-heading" className="border-t border-ink/15 py-10 text-center">
      <h2 id="caution-heading" className="text-[15px] font-semibold text-ink">
        Caution notice
      </h2>
      <div className="mx-auto mt-4 max-w-3xl space-y-3 text-[13px] leading-relaxed text-ink/80">
        <p>Scams by phone, SMS, WhatsApp and email are increasing.</p>
        <p>
          <strong className="font-semibold text-ink">
            {storeInfo.name} never asks for payment
          </strong>{' '}
          for products, contests, lucky draws or free gifts outside this website. Every payment
          happens at checkout here.
        </p>
        <p>
          Got a suspicious message?{' '}
          <Link to="/contact" className="font-semibold text-ink underline underline-offset-2">
            Contact us
          </Link>{' '}
          to check if it&apos;s genuine.
        </p>
        <p>
          <strong className="font-semibold text-ink">Report fraud:</strong> report suspected scams
          on the{' '}
          <a
            href={chakshuPortalUrl}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-ink underline underline-offset-2"
          >
            Chakshu portal
          </a>{' '}
          of the Department of Telecommunications.
        </p>
      </div>
    </section>
  );
}

export function Footer() {
  const categories = useProductCategories();

  return (
    <footer className="mt-24 bg-brand-50 text-ink">
      <div className="container">
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.4fr]">
          <FooterColumn
            title="Orders & support"
            links={[
              { to: '/orders', label: 'Track your order' },
              { to: '/cart', label: 'Your cart' },
              { to: '/profile', label: 'Your account' },
              { to: '/contact', label: 'Contact us' },
            ]}
          />
          <FooterColumn
            title="Information"
            links={policySlugs.map((slug) => ({ to: policyPath(slug), label: policyTitles[slug] }))}
          />
          <address className="not-italic">
            <h2 className={headingClasses}>Contact us</h2>
            <ul className="space-y-2.5 text-sm text-ink/75">
              <li>{storeInfo.address}</li>
              <li>
                <a href={`mailto:${storeInfo.email}`} className={linkClasses}>
                  {storeInfo.email}
                </a>
              </li>
              <li>
                <a href={storeInfo.phoneHref} className={linkClasses}>
                  {storeInfo.phone}
                </a>
              </li>
              <li>{storeInfo.supportHours}</li>
            </ul>
          </address>
          <TrustPanel />
        </div>

        {categories.length > 0 && <PopularSearches categories={categories} />}

        <CautionNotice />

        <div className="flex flex-col items-center gap-4 border-t border-ink/15 py-10">
          <Logo className="h-6 w-auto" />
        </div>
      </div>

      <div className="bg-ink">
        <p className="container py-3 text-center text-xs font-medium text-zinc-400">
          © {currentYear} {storeInfo.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
