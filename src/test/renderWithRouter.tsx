import { Suspense, type ReactElement } from "react";
import { render } from "@testing-library/react";
import { createMemoryRouter, MemoryRouter, Route, RouterProvider, Routes } from "react-router-dom";

import { routes } from "@/app/router";

/** Render a page inside a router at a given URL, so useSearchParams works. */
export function renderWithRouter(ui: ReactElement, { route = "/" }: { route?: string } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="*" element={ui} />
      </Routes>
    </MemoryRouter>,
  );
}

/**
 * Mount the *real* route table at a path.
 *
 * Used by the smoke tests and by page-level integration tests, so they all
 * exercise the actual shell, layout, lazy boundaries and Suspense wiring rather
 * than a hand-built router that could diverge from production.
 */
export function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(
    <Suspense fallback={null}>
      <RouterProvider router={router} />
    </Suspense>,
  );
}
