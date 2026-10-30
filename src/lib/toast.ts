export type Toast = {
  message: string;
  /** Read out for screen readers, e.g. the product name. */
  detail?: string;
  action?: { label: string; to: string };
};

const toastEvent = 'app:toast';

/** Shows a short confirmation at the bottom of the screen (rendered once, in the layout). */
export function showToast(toast: Toast) {
  window.dispatchEvent(new CustomEvent<Toast>(toastEvent, { detail: toast }));
}

/** Calls `listener` for every toast; returns the unsubscribe function. */
export function onToast(listener: (toast: Toast) => void) {
  const handler = (event: Event) => listener((event as CustomEvent<Toast>).detail);
  window.addEventListener(toastEvent, handler);
  return () => window.removeEventListener(toastEvent, handler);
}
