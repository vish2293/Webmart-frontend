const checkoutScriptUrl = 'https://checkout.razorpay.com/v1/checkout.js';

/** What Razorpay Checkout passes to `handler`; the server verifies the signature. */
export type RazorpayPaymentResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  /** Seconds until Razorpay closes the checkout window by itself. */
  timeout?: number;
  handler: (response: RazorpayPaymentResponse) => void;
  modal?: { ondismiss?: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

export type CheckoutOptions = Omit<RazorpayOptions, 'handler' | 'modal'>;

let scriptPromise: Promise<void> | null = null;

/** Loads checkout.js once, on first payment, instead of on every page. */
function loadCheckoutScript() {
  if (window.Razorpay) return Promise.resolve();

  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = checkoutScriptUrl;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      // Allow a retry after a network blip.
      scriptPromise = null;
      script.remove();
      reject(new Error('Could not load the payment window. Check your connection and try again.'));
    };
    document.body.appendChild(script);
  });
  return scriptPromise;
}

/** Resolves with Razorpay's signed response, or `null` if the customer closes the window. */
export async function openRazorpayCheckout(
  options: CheckoutOptions,
): Promise<RazorpayPaymentResponse | null> {
  await loadCheckoutScript();
  const Razorpay = window.Razorpay;
  if (!Razorpay) throw new Error('Payment window is unavailable. Please try again.');

  return new Promise((resolve) => {
    new Razorpay({
      ...options,
      handler: resolve,
      modal: { ondismiss: () => resolve(null) },
    }).open();
  });
}
