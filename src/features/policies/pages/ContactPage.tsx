import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { storeInfo } from '@/app/config/store';
import { PageHeading } from '@/components/ui/PageHeading';
import { policyPath, policySlugs, policyTitles } from '../links';

const linkClasses =
  'font-medium text-ink underline decoration-brand-400 decoration-2 underline-offset-4';

function ContactRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-ink">{icon}</span>
      <div>
        <dt className="text-sm text-graphite">{label}</dt>
        <dd className="text-ink">{children}</dd>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="container pt-8 sm:pt-10">
      <PageHeading description="We usually reply within one business day.">Contact us</PageHeading>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <dl className="space-y-5 rounded-xl border border-line bg-white p-6">
          <ContactRow icon={<Mail size={18} aria-hidden />} label="Email">
            <a href={`mailto:${storeInfo.email}`} className={linkClasses}>
              {storeInfo.email}
            </a>
          </ContactRow>
          <ContactRow icon={<Phone size={18} aria-hidden />} label="Phone">
            <a href={storeInfo.phoneHref} className={linkClasses}>
              {storeInfo.phone}
            </a>
          </ContactRow>
          <ContactRow icon={<Clock size={18} aria-hidden />} label="Support hours">
            {storeInfo.supportHours}
          </ContactRow>
          <ContactRow icon={<MapPin size={18} aria-hidden />} label="Registered address">
            <address className="not-italic">
              {storeInfo.legalName}
              <br />
              {storeInfo.address}
            </address>
          </ContactRow>
        </dl>

        <div className="space-y-6 text-graphite">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-ink">Help with an order</h2>
            <p>
              Include your order number (shown on{' '}
              <Link to="/orders" className={linkClasses}>
                Your orders
              </Link>
              ) so we can help you faster.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold text-ink">Policies</h2>
            <ul className="space-y-2">
              {policySlugs.map((slug) => (
                <li key={slug}>
                  <Link to={policyPath(slug)} className={linkClasses}>
                    {policyTitles[slug]}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
