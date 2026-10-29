import type { Order, RefundReason, RefundStatus } from '../types';

export type OrderViewer = { isAdmin: boolean; isOwner: boolean };

/**
 * Which actions to offer. Mirrors the server's guards so buttons only appear when they'd work;
 * the server still enforces every rule.
 */
export function getOrderActions(order: Order, { isAdmin, isOwner }: OrderViewer) {
  const isOpen = !order.isCancelled && !order.refundedAt;
  const isCashOnDelivery = order.paymentMethod === 'Cash on Delivery';
  const isShipped = order.isShipped === true;

  return {
    canCancel: (isOwner || isAdmin) && isOpen && !isShipped,
    canMarkPaid: isAdmin && isOpen && isCashOnDelivery && !order.isPaid,
    canShip: isAdmin && isOpen && !isShipped && (order.isPaid || isCashOnDelivery),
    canDeliver: isAdmin && isOpen && isShipped && !order.isDelivered,
    canRefund: isAdmin && isOpen && order.isPaid,
  };
}

export const isOrderRefunded = (order: Order) =>
  Boolean(order.refundedAt) ||
  (order.refunds ?? []).some((refund) => refund.status === 'processed');

export const refundReasonLabels: Record<RefundReason, string> = {
  customer_cancel: 'Cancelled by customer',
  admin_cancel: 'Cancelled by store',
  admin_refund: 'Refunded by store',
  late_payment: 'Paid after the order closed',
  duplicate_payment: 'Duplicate payment',
};

export const refundStatusLabels: Record<RefundStatus, string> = {
  pending: 'Refund in progress',
  processed: 'Refunded',
  failed: 'Refund failed',
  manual_required: 'Refund to be settled manually',
};

const paymentMethodLabels: Record<string, string> = {
  upi: 'UPI',
  card: 'Card',
  netbanking: 'Net banking',
  wallet: 'Wallet',
  emi: 'EMI',
};

export const formatPaymentMethod = (method: string | undefined) =>
  method ? (paymentMethodLabels[method] ?? method) : undefined;
