import { RouterProvider } from "react-router-dom";

import { router } from "./router";

/**
 * Application root.
 *
 * Providers are intentionally thin: cart and toast state are Zustand stores
 * (no provider needed), routing is handled by RouterProvider, and there is no
 * data-fetching library because every network call is a form submission in a
 * `services/` module. Fewer layers, less to explain.
 *
 * `v7_startTransition` / `v7_relativeSplatPath` etc. are React Router 7
 * defaults — no future flags are required.
 */
export function App() {
  return <RouterProvider router={router} />;
}
