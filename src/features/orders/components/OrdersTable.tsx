import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import type { Order } from '../types';
import { isOrderRefunded } from '../utils/orderActions';
import { CancelledBadge, RefundedBadge, StatusBadge } from './StatusBadge';

type OrdersTableProps = {
  orders: Order[];
  showCustomer?: boolean;
  /** Extra per-row controls, e.g. admin "mark delivered". */
  renderActions?: (order: Order) => ReactNode;
};

const customerName = (order: Order) =>
  typeof order.user === 'object' && order.user ? order.user.name : '—';

const headerCell = 'px-4 py-2.5 text-left text-xs font-medium text-graphite';

export function OrdersTable({ orders, showCustomer = false, renderActions }: OrdersTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-white">
      <table className="w-full min-w-[720px] divide-y divide-line text-sm">
        <thead className="bg-mist">
          <tr>
            <th scope="col" className={headerCell}>
              Order
            </th>
            {showCustomer && (
              <th scope="col" className={headerCell}>
                Customer
              </th>
            )}
            <th scope="col" className={headerCell}>
              Date
            </th>
            <th scope="col" className={headerCell}>
              Total
            </th>
            <th scope="col" className={headerCell}>
              Payment
            </th>
            <th scope="col" className={headerCell}>
              Delivery
            </th>
            <th scope="col" className={`${headerCell} text-right`}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {orders.map((order) => (
            <tr key={order._id} className="hover:bg-mist/60">
              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-graphite">
                #{order._id.slice(-8)}
                {order.deliveryOption === 'express' && (
                  <span className="ml-2 rounded-full bg-brand-400 px-2 py-0.5 font-sans text-[11px] font-semibold text-ink">
                    Express
                  </span>
                )}
              </td>
              {showCustomer && (
                <td className="whitespace-nowrap px-4 py-3">{customerName(order)}</td>
              )}
              <td className="whitespace-nowrap px-4 py-3">{formatDate(order.createdAt)}</td>
              <td className="whitespace-nowrap px-4 py-3 font-semibold">
                {formatCurrency(order.totalPrice)}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                {isOrderRefunded(order) ? (
                  <RefundedBadge />
                ) : order.isCancelled ? (
                  <CancelledBadge />
                ) : (
                  <StatusBadge isDone={order.isPaid} doneLabel="Paid" pendingLabel="Unpaid" />
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <StatusBadge
                  isDone={order.isDelivered || order.isShipped === true}
                  doneLabel={order.isDelivered ? 'Delivered' : 'Shipped'}
                  pendingLabel="Pending"
                />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  {renderActions?.(order)}
                  <Link
                    to={`/orders/${order._id}`}
                    className="rounded-md px-2.5 py-1.5 text-[13px] font-semibold text-ink decoration-brand-400 decoration-2 underline-offset-4 hover:underline"
                  >
                    View<span className="sr-only"> order {order._id.slice(-8)}</span>
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
