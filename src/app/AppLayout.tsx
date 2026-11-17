import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToastViewport } from "@/components/feedback/Toast";
import { PageLoading } from "@/components/feedback/PageLoading";
import { useCartSync } from "@/features/cart/hooks/useCartSync";

/**
 * The one shared layout: skip link, header, routed content, footer, toasts.
 * Pages are rendered through <Outlet> so no page re-declares chrome.
 */
export function AppLayout() {
  const location = useLocation();

  // Cross-tab basket synchronisation lives at the app root, once.
  useCartSync();

  /**
   * Client-side navigation does not reset scroll the way a page load does.
   * The original site was multi-page, so every link jumped to the top — this
   * preserves that expectation, except when the URL carries a hash target.
   */
  useEffect(() => {
    if (location.hash) return;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname, location.hash]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[1000] focus:rounded-full focus:bg-espresso focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-cream"
      >
        Skip to main content
      </a>

      <Header />

      <main id="main-content" tabIndex={-1} className="flex-1">
        <Suspense fallback={<PageLoading />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />
      <ToastViewport />
    </div>
  );
}
