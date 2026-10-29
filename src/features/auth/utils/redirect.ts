/**
 * Route guards store the page the user tried to reach in `location.state.from`.
 * Only same-app paths are honoured to avoid open redirects.
 */
export function getRedirectTarget(state: unknown, fallback = '/'): string {
  if (state && typeof state === 'object' && 'from' in state && typeof state.from === 'string') {
    // Browsers treat "/\evil.com" like "//evil.com", so backslashes are rejected outright.
    const isSameAppPath =
      state.from.startsWith('/') && !state.from.startsWith('//') && !state.from.includes('\\');
    return isSameAppPath ? state.from : fallback;
  }
  return fallback;
}
