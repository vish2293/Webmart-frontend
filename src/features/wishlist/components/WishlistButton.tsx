import { useLocation, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuth } from '@/features/auth';
import type { Product } from '@/features/products';
import { showToast } from '@/lib/toast';
import { useToggleWishlist, useWishlist } from '../hooks/useWishlist';

type WishlistButtonProps = {
  product: Product;
  /** `overlay`: round button on a card image. `inline`: labelled button on the product page. */
  variant?: 'overlay' | 'inline';
};

/** Heart toggle. Guests are sent to log in and come back here afterwards. */
export function WishlistButton({ product, variant = 'overlay' }: WishlistButtonProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const wishlist = useWishlist({ enabled: isAuthenticated });
  const toggle = useToggleWishlist();
  const isSaved = wishlist.data?.some((item) => item._id === product._id) ?? false;

  const handleClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }
    toggle.mutate(
      { product, isSaved },
      {
        // Only once the server confirms, so the toast never promises a save that failed.
        onSuccess: () => {
          if (!isSaved) {
            showToast({
              message: 'Added to wishlist',
              detail: product.name,
              action: { label: 'View wishlist', to: '/wishlist' },
            });
          }
        },
      },
    );
  };

  const label = isSaved
    ? `Remove ${product.name} from wishlist`
    : `Save ${product.name} to wishlist`;
  const heart = (
    <Heart
      size={variant === 'overlay' ? 18 : 18}
      aria-hidden
      className={isSaved ? 'fill-red-500 text-red-500' : 'text-ink'}
    />
  );

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={isSaved}
        aria-label={label}
        className="inline-flex h-12 items-center gap-2 rounded-lg border border-line bg-white px-4 text-[15px] font-semibold text-ink transition-colors hover:border-ink"
      >
        {heart}
        {isSaved ? 'Saved' : 'Save'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isSaved}
      aria-label={label}
      className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition-colors hover:bg-white"
    >
      {heart}
    </button>
  );
}
