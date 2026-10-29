import { Suspense, useState } from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import { LoadingState } from '@/components/feedback/LoadingState';
import { AnnouncementBar } from './AnnouncementBar';
import { Footer } from './Footer';
import { Header } from './Header';
import { MobileNav } from './MobileNav';

export function AppLayout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>
      <AnnouncementBar />
      <Header onOpenMobileNav={() => setIsMobileNavOpen(true)} />
      <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
      <main id="main-content" className="flex-1">
        <Suspense fallback={<LoadingState />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
