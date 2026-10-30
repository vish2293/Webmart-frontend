import { Link } from 'react-router-dom';
import { Gift, Minus, Plus, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { getErrorMessage } from '@/lib/httpClient';
import { formatCurrencyWhole } from '@/utils/formatCurrency';
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
    <Card aria-labelledby="points-heading">
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
          <div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-ink p-5 text-white">
            <div>
              <p className="text-sm text-white/70">Available balance</p>
              <p className="mt-1 text-4xl font-bold tabular-nums tracking-display text-brand-400">
                {rewards.data.pointsBalance.toLocaleString('en-IN')}
                <span className="ml-2 text-sm font-medium text-white/70">points</span>
              </p>
            </div>
            <p className="rounded-lg bg-white/10 px-3 py-2 text-right text-sm">
              Worth{' '}
              <strong className="font-semibold">
                {formatCurrencyWhole(rewards.data.pointsBalance)}
              </strong>
              <span className="block text-xs text-white/60">1 point = ₹1</span>
            </p>
          </div>

          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-lg border border-line p-3">
              <dt className="font-semibold text-ink">How you earn</dt>
              <dd className="mt-0.5 text-graphite">
                1 point per ₹100 spent (2 with Plus), once your order is delivered.
              </dd>
            </div>
            <div className="rounded-lg border border-line p-3">
              <dt className="font-semibold text-ink">How you spend</dt>
              <dd className="mt-0.5 text-graphite">
                Use points at checkout for up to 20% off an order.
              </dd>
            </div>
          </dl>
          {rewards.data.isFirstOrderEligible && (
            <p className="mt-3 flex items-start gap-2 rounded-lg bg-brand-50 p-3 text-sm text-ink">
              <Sparkles size={16} className="mt-0.5 shrink-0" aria-hidden />
              Your first order gets 10% off (up to ₹200), applied automatically at checkout.
            </p>
          )}

          {rewards.data.history.length > 0 && (
            <>
              <h3 className="mb-1 mt-6 text-sm font-semibold text-ink">Recent activity</h3>
              <ul className="divide-y divide-line">
                {rewards.data.history.slice(0, visibleHistory).map((entry) => {
                  const isGain = entry.points >= 0;
                  return (
                    <li
                      key={`${entry.order}-${entry.type}`}
                      className="flex items-center gap-3 py-3"
                    >
                      <span
                        aria-hidden
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          isGain ? 'bg-green-100 text-green-700' : 'bg-mist text-ink'
                        }`}
                      >
                        {isGain ? <Plus size={15} /> : <Minus size={15} />}
                      </span>
                      <div className="min-w-0 flex-1 text-sm">
                        <p className="font-medium text-ink">
                          {historyLabels[entry.type]}
                          {!isMembershipEntry(entry.type) && (
                            <>
                              {' '}
                              ·{' '}
                              <Link
                                to={`/orders/${entry.order}`}
                                className="font-normal text-graphite underline underline-offset-2 hover:text-ink"
                              >
                                order #{entry.order.slice(-8)}
                              </Link>
                            </>
                          )}
                        </p>
                        <p className="text-xs text-graphite">{formatDate(entry.createdAt)}</p>
                      </div>
                      <span
                        className={`font-semibold tabular-nums ${isGain ? 'text-green-700' : 'text-ink'}`}
                      >
                        {isGain ? '+' : ''}
                        {entry.points}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </>
      )}
    </Card>
  );
}
