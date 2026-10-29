import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/httpClient';
import * as ordersApi from '../api/ordersApi';
import { openRazorpayCheckout } from '../api/razorpayCheckout';

export const orderKeys = {
  all: ['orders'] as const,
  mine: () => [...orderKeys.all, 'mine'] as const,
  admin: () => [...orderKeys.all, 'admin'] as const,
  detail: (orderId: string) => [...orderKeys.all, 'detail', orderId] as const,
};

export function useMyOrders() {
  return useQuery({
    queryKey: orderKeys.mine(),
    queryFn: ({ signal }) => ordersApi.getMyOrders(signal),
  });
}

export function useAllOrders() {
  return useQuery({
    queryKey: orderKeys.admin(),
    queryFn: ({ signal }) => ordersApi.getAllOrders(signal),
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: ({ signal }) => ordersApi.getOrder(orderId, signal),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.createOrder,
    onSuccess: (order) => queryClient.setQueryData(orderKeys.detail(order._id), order),
    // Either way stock (and maybe prices) changed server-side; refresh what the cart shows.
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

/** Leave a margin so a payment started at the last second still completes before expiry. */
const checkoutSafetyMarginSeconds = 60;

type RazorpayPaymentInput = {
  orderId: string;
  payer: { name: string; email: string };
};

/**
 * Runs the full online payment: create gateway order → Razorpay window → server verification.
 * Resolves with the paid order, or `null` if the customer closed the window.
 */
export function useRazorpayPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, payer }: RazorpayPaymentInput) => {
      const session = await ordersApi.startRazorpayPayment(orderId);
      const secondsLeft =
        Math.floor((Date.parse(session.expiresAt) - Date.now()) / 1000) -
        checkoutSafetyMarginSeconds;
      if (secondsLeft <= 0) {
        throw new Error('The payment window for this order has closed. Please place a new order.');
      }

      const response = await openRazorpayCheckout({
        // Razorpay closes the window itself, so no payment can start after the order expires.
        timeout: secondsLeft,
        key: session.keyId,
        order_id: session.razorpayOrderId,
        amount: session.amount,
        currency: session.currency,
        name: 'Webvoltz Store',
        description: `Order #${orderId.slice(-8)}`,
        prefill: payer,
        theme: { color: '#FFC107' },
      });
      if (!response) return null;

      try {
        return await ordersApi.verifyRazorpayPayment(orderId, response);
      } catch (error) {
        // e.g. ORDER_EXPIRED: the server's message explains the refund.
        if (error instanceof ApiError && error.status === 409) throw error;
        // Otherwise the charge went through; the server's webhook will still mark it paid.
        throw new Error(
          'We received your payment but could not confirm it yet. Your order will update automatically in a few minutes.',
        );
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  });
}

/** Admin only: confirm cash collected for a cash-on-delivery order. */
export function useMarkOrderPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.markOrderPaid,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  });
}

export function useDeliverOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.deliverOrder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  });
}
