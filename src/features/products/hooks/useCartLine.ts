import { useCart } from '@/features/cart';
import type { Product } from '../types';

/** This product's line in the cart: current quantity plus actions to change it. */
export function useCartLine(product: Product) {
  const { items, addItem, setQuantity } = useCart();
  const quantity = items.find((item) => item.productId === product._id)?.quantity ?? 0;

  return {
    quantity,
    add: () =>
      addItem({
        productId: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        countInStock: product.countInStock,
      }),
    /** 0 removes the line. */
    setQuantity: (next: number) => setQuantity(product._id, next),
  };
}
