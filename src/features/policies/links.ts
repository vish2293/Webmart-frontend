// Kept apart from the policy text so the footer (on every page) doesn't pull it into the
// main bundle; the full text loads with the lazy policy page.
export const policyTitles = {
  terms: 'Terms & Conditions',
  privacy: 'Privacy Policy',
  refunds: 'Refund & Cancellation Policy',
  shipping: 'Shipping & Delivery Policy',
  membership: 'Plus Membership Terms',
} as const;

export type PolicySlug = keyof typeof policyTitles;

export const policySlugs = Object.keys(policyTitles) as PolicySlug[];

export const isPolicySlug = (value: string): value is PolicySlug => value in policyTitles;

export const policyPath = (slug: PolicySlug) => `/policies/${slug}`;
