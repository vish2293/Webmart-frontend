import { Suspense, useState } from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/features/auth';
import { AnnouncementBar } from './AnnouncementBar';
import { Footer } from './Footer';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { Toaster } from './Toaster';

export function AppLayout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>
      <AnnouncementBar />
      <Header
        onOpenMobileNav={() => setIsMobileNavOpen(true)}
        onRequestLogout={() => setIsLogoutConfirmOpen(true)}
      />
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        onRequestLogout={() => setIsLogoutConfirmOpen(true)}
      />
      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        title="Log out?"
        description="You'll need to log in again to see your orders and checkout. Your cart stays saved on this device."
        confirmLabel="Log out"
        confirmVariant="danger"
        onCancel={() => setIsLogoutConfirmOpen(false)}
        onConfirm={() => {
          setIsLogoutConfirmOpen(false);
          logout();
        }}
      />
      {/* min-w-0: a flex item won't shrink below its content, so one wide child (a scrolling
          product row) would otherwise stretch the whole page and cause sideways scrolling. */}
      <main id="main-content" className="min-w-0 flex-1">
        <Suspense fallback={<LoadingState />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <Toaster />
      <ScrollRestoration />
    </div>
  );
}
