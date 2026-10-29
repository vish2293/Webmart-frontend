import { Heart } from 'lucide-react';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { PageHeading } from '@/components/ui/PageHeading';
import { ProductGrid } from '@/features/products/components/ProductGrid';
import { getErrorMessage } from '@/lib/httpClient';
import { useWishlist } from '../hooks/useWishlist';

export default function WishlistPage() {
  const wishlist = useWishlist({ enabled: true });

  const renderContent = () => {
    if (wishlist.isPending) return <LoadingState label="Loading your wishlist…" />;
    if (wishlist.isError) {
      return (
        <ErrorState message={getErrorMessage(wishlist.error)} onRetry={() => wishlist.refetch()} />
      );
    }
    if (wishlist.data.length === 0) {
      return (
        <EmptyState
          icon={<Heart size={28} aria-hidden />}
          title="Your wishlist is empty"
          description="Tap the heart on any product to save it here for later."
          action={<ButtonLink to="/products">Browse products</ButtonLink>}
        />
      );
    }
    return <ProductGrid products={wishlist.data} />;
  };

  return (
    <div className="container pt-8 sm:pt-10">
      <PageHeading
        description={
          wishlist.data
            ? `${wishlist.data.length} saved ${wishlist.data.length === 1 ? 'item' : 'items'}`
            : undefined
        }
      >
        Wishlist
      </PageHeading>
      {renderContent()}
    </div>
  );
}
