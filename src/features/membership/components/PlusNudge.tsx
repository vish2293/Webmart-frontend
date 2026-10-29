import { Link } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { useMembership } from '../hooks/useMembership';

/** Small "join Plus" prompt for the cart and checkout. Hidden for members. */
export function PlusNudge({ children }: { children: string }) {
  const { isAuthenticated } = useAuth();
  const membership = useMembership({ enabled: isAuthenticated });
  if (isAuthenticated && (membership.isPending || membership.data?.isMember)) return null;

  return (
    <Link
      to="/plus"
      className="flex items-start gap-2 rounded-lg border border-brand-400 bg-brand-50 px-3 py-2 text-[13px] text-ink hover:bg-brand-100"
    >
      <Crown size={16} className="mt-0.5 shrink-0" aria-hidden />
      <span>{children}</span>
    </Link>
  );
}
