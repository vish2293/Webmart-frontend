import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageHeading } from '@/components/ui/PageHeading';
import { PriceSummary } from '@/components/ui/PriceSummary';
import { CartLineItem } from '../components/CartLineItem';
import { useCart } from '../hooks/useCart';
import { calculateOrderPricing, pricingRules } from '../utils/pricing';
import { formatCurrency } from '@/utils/formatCurrency';

export default function CartPage() {
  const { items, itemCount, setQuantity, removeItem, clearCart } = useCart();
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  if (items.length === 0) {
    return (
      <div className="container pt-8 sm:pt-10">
        <PageHeading>Cart</PageHeading>
        <EmptyState
          icon={<ShoppingBag size={28} aria-hidden />}
          title="Your cart is empty"
          description="Add products from the shop and they'll show up here."
          action={<ButtonLink to="/products">Browse products</ButtonLink>}
        />
      </div>
    );
  }

  const pricing = calculateOrderPricing(items);
  const amountToFreeShipping = pricingRules.freeShippingThreshold - pricing.itemsPrice;

  return (
    <div className="container pt-8 sm:pt-10">
      <PageHeading
        description={`${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
        actions={
          <button
            type="button"
            onClick={() => setIsConfirmingClear(true)}
            className="text-sm font-medium text-graphite hover:text-red-700"
          >
            Clear cart
          </button>
        }
      >
        Cart
      </PageHeading>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:gap-12">
        <section aria-label="Cart items">
          <ul className="divide-y divide-line border-y border-line">
            {items.map((item) => (
              <CartLineItem
                key={item.productId}
                item={item}
                onQuantityChange={(quantity) => setQuantity(item.productId, quantity)}
                onRemove={() => removeItem(item.productId)}
              />
            ))}
          </ul>
        </section>

        <PriceSummary {...pricing}>
          {amountToFreeShipping > 0 && (
            <p className="rounded-lg bg-brand-50 px-3 py-2 text-[13px] text-ink">
              Add {formatCurrency(amountToFreeShipping)} more for free shipping.
            </p>
          )}
          <ButtonLink to="/checkout/shipping" className="w-full">
            Check out
          </ButtonLink>
          <ButtonLink to="/products" variant="ghost" className="w-full">
            Continue shopping
          </ButtonLink>
        </PriceSummary>
      </div>

      <ConfirmDialog
        isOpen={isConfirmingClear}
        title="Clear your cart?"
        description="All items will be removed from your cart."
        confirmLabel="Clear cart"
        confirmVariant="danger"
        onConfirm={() => {
          clearCart();
          setIsConfirmingClear(false);
        }}
        onCancel={() => setIsConfirmingClear(false)}
      />
    </div>
  );
}
