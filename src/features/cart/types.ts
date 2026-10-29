export type CartItem = {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  /** Stock when last refreshed from the catalogue; used to cap quantity. */
  countInStock: number;
};

/** The catalogue fields a cart line mirrors. */
export type CatalogueSnapshot = Pick<CartItem, 'name' | 'price' | 'imageUrl' | 'countInStock'>;

export type OrderPricing = {
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
};
