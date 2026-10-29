const rawApiUrl = import.meta.env.VITE_API_URL;

function parseApiUrl(value: string | undefined): string {
  if (!value) throw new Error('VITE_API_URL is not set. Copy .env.example to .env.');
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(
      `VITE_API_URL must be an absolute URL like http://localhost:5000/api (got "${value}").`,
    );
  }
  if (!['http:', 'https:'].includes(url.protocol) || !value.includes('://')) {
    throw new Error(`VITE_API_URL must start with http:// or https:// (got "${value}").`);
  }
  return value.replace(/\/$/, '');
}

export const env = {
  apiUrl: parseApiUrl(rawApiUrl),
} as const;
