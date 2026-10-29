import { Headset, RotateCcw, ShieldCheck, Zap, type LucideIcon } from 'lucide-react';

const reasons: { title: string; detail: string; Icon: LucideIcon }[] = [
  { title: 'Secure payments', detail: 'UPI and cards, processed by Razorpay', Icon: ShieldCheck },
  {
    title: 'Easy cancellations',
    detail: 'Cancel before it ships for an automatic refund',
    Icon: RotateCcw,
  },
  { title: 'Express delivery', detail: 'Get it in 1–2 days, free with Plus', Icon: Zap },
  { title: 'Real support', detail: 'Help by phone or email, six days a week', Icon: Headset },
];

export function TrustStrip() {
  return (
    <section aria-label="Why shop with us" className="border-y border-line bg-mist">
      <ul className="container grid grid-cols-2 gap-x-4 gap-y-6 py-8 lg:grid-cols-4">
        {reasons.map(({ title, detail, Icon }) => (
          <li key={title} className="flex items-start gap-3">
            <Icon size={22} className="mt-0.5 shrink-0 text-ink" aria-hidden />
            <span>
              <span className="block text-sm font-semibold text-ink">{title}</span>
              <span className="block text-xs leading-relaxed text-graphite">{detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
