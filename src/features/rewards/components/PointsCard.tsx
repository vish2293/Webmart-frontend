import { Link } from 'react-router-dom';
import { Gift, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { getErrorMessage } from '@/lib/httpClient';
import { formatDate } from '@/utils/formatDate';
import { useRewards } from '../hooks/useRewards';
import type { PointsTransactionType } from '../types';

const historyLabels: Record<PointsTransactionType, string> = {
  earn: 'Earned',
  earn_revoke: 'Removed (refund)',
  redeem: 'Used',
  redeem_return: 'Returned',
  revive_redeem: 'Used',
  revive_return: 'Returned',
  membership_bonus: 'Plus welcome bonus',
  membership_bonus_revoke: 'Plus bonus removed (refund)',
};

const isMembershipEntry = (type: PointsTransactionType) => type.startsWith('membership_');

const visibleHistory = 10;

export function PointsCard() {
  const rewards = useRewards();

  return (
    <Card aria-labelledby="points-heading" className="mx-auto mt-8 max-w-lg">
      <h2 id="points-heading" className="flex items-center gap-2 text-lg font-semibold text-ink">
        <Gift size={20} aria-hidden /> Reward points
      </h2>

      {rewards.isPending && <p className="mt-3 text-sm text-graphite">Loading your points…</p>}
      {rewards.isError && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {getErrorMessage(rewards.error, 'Could not load your points.')}
        </p>
      )}

      {rewards.data && (
        <>
          <p className="mt-3 text-3xl font-bold text-ink">
            {rewards.data.pointsBalance.toLocaleString('en-IN')}
            <span className="ml-2 text-sm font-medium text-graphite">points · 1 point = ₹1</span>
          </p>
          <p className="mt-1 text-sm text-graphite">
            Earn 1 point for every ₹100 you spend (2 with Plus), once your order is delivered. Use
            them at checkout for up to 20% off.
          </p>
          {rewards.data.isFirstOrderEligible && (
            <p className="mt-3 flex items-start gap-2 rounded-lg bg-brand-50 p-3 text-sm text-ink">
              <Sparkles size={16} className="mt-0.5 shrink-0" aria-hidden />
              Your first order gets 10% off (up to ₹200), applied automatically at checkout.
            </p>
          )}

          {rewards.data.history.length > 0 && (
            <>
              <h3 className="mb-2 mt-5 text-sm font-semibold text-ink">Recent activity</h3>
              <ul className="divide-y divide-line text-sm">
                {rewards.data.history.slice(0, visibleHistory).map((entry) => (
                  <li
                    key={`${entry.order}-${entry.type}`}
                    className="flex items-center justify-between py-2"
                  >
                    <span>
                      {historyLabels[entry.type]}
                      {!isMembershipEntry(entry.type) && (
                        <>
                          {' '}
                          ·{' '}
                          <Link
                            to={`/orders/${entry.order}`}
                            className="text-graphite underline underline-offset-2"
                          >
                            order #{entry.order.slice(-8)}
                          </Link>
                        </>
                      )}
                      <span className="ml-2 text-graphite">{formatDate(entry.createdAt)}</span>
                    </span>
                    <span
                      className={`font-semibold ${entry.points >= 0 ? 'text-green-700' : 'text-ink'}`}
                    >
                      {entry.points >= 0 ? '+' : ''}
                      {entry.points}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </Card>
  );
}
