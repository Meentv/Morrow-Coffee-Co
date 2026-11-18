import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "./AppLayout";
import { RouteError } from "@/components/feedback/RouteError";

/**
 * Route table.
 *
 * Every page is a separate chunk (React.lazy + Suspense in AppLayout), so the
 * first visit downloads only the shell; a visitor who never opens /menu never
 * downloads the menu page.
 */
const HomePage = lazy(() => import("@/pages/HomePage"));
const MenuPage = lazy(() => import("@/pages/MenuPage"));
const ShopPage = lazy(() => import("@/pages/ShopPage"));
const KitchenPage = lazy(() => import("@/pages/KitchenPage"));
const OrderPage = lazy(() => import("@/pages/OrderPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

export const routes = [
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "menu", element: <MenuPage /> },
      { path: "shop", element: <ShopPage /> },
      { path: "kitchen", element: <KitchenPage /> },
      { path: "order", element: <OrderPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
