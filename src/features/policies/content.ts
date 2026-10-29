import { storeInfo } from '@/app/config/store';
import { pricingRules } from '@/features/cart';
import { formatCurrency } from '@/utils/formatCurrency';
import { policyTitles, type PolicySlug } from './links';

// ponytail: sample policy text so the pages exist and read sensibly. Have it reviewed and
// replaced with your actual terms before going live; it is not legal advice.

export type PolicySection = { heading: string; paragraphs: string[] };
export type Policy = { title: string; summary: string; sections: PolicySection[] };

/** Must match ORDER_PAYMENT_WINDOW_MINUTES on the server. */
const paymentWindowMinutes = 30;
const flatShipping = formatCurrency(pricingRules.flatShippingPrice);
const freeShippingOver = formatCurrency(pricingRules.freeShippingThreshold);
const taxPercent = `${pricingRules.taxRate * 100}%`;

export const policies: Record<PolicySlug, Policy> = {
  terms: {
    title: policyTitles.terms,
    summary: `These terms apply when you browse or buy from ${storeInfo.name}.`,
    sections: [
      {
        heading: 'About us',
        paragraphs: [
          `This website is operated by ${storeInfo.legalName}, ${storeInfo.address}. By using the site or placing an order you agree to these terms.`,
        ],
      },
      {
        heading: 'Your account',
        paragraphs: [
          'You are responsible for keeping your password safe and for all activity on your account. Tell us straight away if you think someone else has accessed it.',
          'We may suspend accounts that are used for fraud, abuse or to place orders without intending to pay.',
        ],
      },
      {
        heading: 'Orders and pricing',
        paragraphs: [
          `All prices are in Indian Rupees. Tax of ${taxPercent} and any shipping charge are added at checkout and shown before you place your order.`,
          'Placing an order is an offer to buy. The order is confirmed once payment is received (or, for cash on delivery, once we dispatch it). We may cancel an order if an item is out of stock or was listed at a clearly wrong price; any amount paid is refunded in full.',
          'If a price changes while items are in your cart, we show you the updated price before you can place the order.',
        ],
      },
      {
        heading: 'Payments',
        paragraphs: [
          'Online payments (UPI, cards, net banking and wallets) are processed securely by Razorpay. We never see or store your full card details.',
          `Online orders must be paid within ${paymentWindowMinutes} minutes of being placed. Unpaid orders are cancelled automatically after that and the items are released for other customers.`,
          'Cash on delivery is available on eligible orders; please keep the exact amount ready.',
        ],
      },
      {
        heading: 'Product information',
        paragraphs: [
          'We try to describe and photograph products accurately, but colours and details may vary slightly by screen. Product images are for illustration.',
        ],
      },
      {
        heading: 'Limitation of liability',
        paragraphs: [
          'To the extent allowed by law, our liability for any order is limited to the amount you paid for it. We are not liable for indirect or consequential losses.',
        ],
      },
      {
        heading: 'Governing law',
        paragraphs: [
          `These terms are governed by the laws of India. Disputes are subject to the jurisdiction of the courts in ${storeInfo.jurisdictionCity}.`,
        ],
      },
      {
        heading: 'Changes to these terms',
        paragraphs: [
          'We may update these terms from time to time. The version on this page when you place an order applies to that order.',
        ],
      },
    ],
  },

  privacy: {
    title: policyTitles.privacy,
    summary: 'What we collect, why we collect it and how we keep it safe.',
    sections: [
      {
        heading: 'Information we collect',
        paragraphs: [
          'Account details: your name, email address and a securely hashed password.',
          'Order details: shipping address, the items you buy and your order history.',
          'Payment details are entered on Razorpay’s secure checkout. We only receive a payment reference and status, never your card number, UPI PIN or bank login.',
        ],
      },
      {
        heading: 'How we use it',
        paragraphs: [
          'To process and deliver your orders, send order updates, provide customer support, prevent fraud and comply with tax and legal requirements.',
          'We do not sell your personal information.',
        ],
      },
      {
        heading: 'Who we share it with',
        paragraphs: [
          'Razorpay, to process payments; delivery partners, who receive your name, address and phone number to deliver your order; and authorities, where the law requires it.',
        ],
      },
      {
        heading: 'Storage on your device',
        paragraphs: [
          'Your cart, checkout details and sign-in session are stored in your browser’s local storage so they survive a page refresh. Signing out removes your session.',
        ],
      },
      {
        heading: 'Security and retention',
        paragraphs: [
          'Passwords are hashed and never stored in plain text. All traffic to the site is encrypted. We keep order records for as long as tax law requires, and account data until you ask us to delete it.',
        ],
      },
      {
        heading: 'Your choices',
        paragraphs: [
          `You can view and update your name, email and password from your profile. To get a copy of your data or have your account deleted, email ${storeInfo.email}.`,
        ],
      },
    ],
  },

  refunds: {
    title: policyTitles.refunds,
    summary: 'How to cancel an order, return an item and get your money back.',
    sections: [
      {
        heading: 'Cancelling an order',
        paragraphs: [
          `You can cancel an order free of charge before it is shipped. Contact us at ${storeInfo.email} or ${storeInfo.phone} with your order number.`,
          `Online orders that are not paid within ${paymentWindowMinutes} minutes are cancelled automatically. You are not charged for them.`,
          'Once an order has been shipped it cannot be cancelled, but you can return it under the policy below.',
        ],
      },
      {
        heading: 'Returns',
        paragraphs: [
          'You can return most items within 7 days of delivery if they are unused, in their original packaging and with all tags and accessories.',
          'For hygiene reasons, opened beauty, skin-care and personal-care products cannot be returned unless they arrived damaged or defective.',
        ],
      },
      {
        heading: 'Damaged, defective or wrong items',
        paragraphs: [
          'If your item arrives damaged, defective or is not what you ordered, tell us within 48 hours of delivery with photos of the item and packaging. We will arrange a free pickup and a replacement or full refund.',
        ],
      },
      {
        heading: 'Refunds',
        paragraphs: [
          'Once we receive and inspect a returned item, we approve the refund within 2 business days.',
          'Prepaid orders are refunded to the original payment method. Banks usually take 5 to 7 business days to show the credit.',
          'Cash-on-delivery orders are refunded by bank transfer or UPI to an account you provide.',
          'If a payment completes after your order was automatically cancelled and the items are no longer available, the full amount is refunded to the original payment method.',
        ],
      },
      {
        heading: 'Shipping charges',
        paragraphs: [
          'Shipping charges are refunded only if the return is because of our mistake (damaged, defective or wrong item).',
        ],
      },
    ],
  },

  shipping: {
    title: policyTitles.shipping,
    summary: 'Where we deliver, how long it takes and what it costs.',
    sections: [
      {
        heading: 'Where we deliver',
        paragraphs: [
          'We deliver to serviceable PIN codes across India. If we cannot deliver to your address, we cancel the order and refund any payment in full.',
        ],
      },
      {
        heading: 'Shipping charges',
        paragraphs: [
          `Shipping is free on orders over ${freeShippingOver}. A flat fee of ${flatShipping} applies to smaller orders. The exact charge is shown at checkout before you pay.`,
        ],
      },
      {
        heading: 'Delivery times',
        paragraphs: [
          'Orders are packed and dispatched within 1 to 2 business days of confirmation.',
          'Delivery usually takes 3 to 7 business days after dispatch, depending on your location. Remote areas may take longer.',
        ],
      },
      {
        heading: 'Tracking your order',
        paragraphs: [
          'You can see the payment and delivery status of every order on the “Your orders” page.',
        ],
      },
      {
        heading: 'Delays and failed deliveries',
        paragraphs: [
          'Weather, holidays or courier issues can occasionally delay delivery; we will keep you informed.',
          'Please make sure your address and phone number are correct. If delivery fails after repeated attempts, the order is returned to us and refunded minus shipping charges.',
        ],
      },
    ],
  },
};
