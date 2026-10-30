import { useCart } from '@/features/cart';
import { showToast } from '@/lib/toast';
import type { Product } from '../types';

/** This product's line in the cart: current quantity plus actions to change it. */
export function useCartLine(product: Product) {
  const { items, addItem, setQuantity } = useCart();
  const quantity = items.find((item) => item.productId === product._id)?.quantity ?? 0;

  return {
    quantity,
    add: () => {
      addItem({
        productId: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        countInStock: product.countInStock,
      });
      showToast({
        message: 'Product added to cart',
        detail: product.name,
        action: { label: 'View cart', to: '/cart' },
      });
    },
    /** 0 removes the line. */
    setQuantity: (next: number) => setQuantity(product._id, next),
  };
}
