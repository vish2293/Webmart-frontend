// Store identity shown in the footer, policy pages and contact page. Edit here only.
// ponytail: placeholder details — replace with the real business name, address and contacts
// before going live (Razorpay checks these pages when activating live payments).
export const storeInfo = {
  name: 'Webvoltz Store',
  legalName: 'Webvoltz Store (sample business name)',
  email: 'support@example.com',
  phone: '+91 00000 00000',
  phoneHref: 'tel:+910000000000',
  address: '123 Sample Street, Sample City, State 000000, India',
  supportHours: 'Monday to Saturday, 10:00 AM to 6:00 PM IST',
  /** City whose courts handle disputes, used in the terms. */
  jurisdictionCity: 'Sample City',
  policiesLastUpdated: '29 October 2026',
} as const;
