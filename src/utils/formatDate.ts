export const formatDate = (isoDate: string | undefined | null): string =>
  isoDate ? new Date(isoDate).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—';
