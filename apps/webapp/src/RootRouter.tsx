import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { ProtectedRoute } from "./core/auth/ProtectedRoute";
import PageNotFound from "./components/PageNotFound/PageNotFound";
import { authRoutes } from "./features/auth/Routes";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import GualletAppShell from "./components/layout/GualletAppShell";
import { accountRoutes } from "./features/accounts/Routes";
import * as Sentry from "@sentry/react";
import { categoriesRoutes } from "./features/categories/Routes";

const sentryCreateBrowserRouter =
  Sentry.wrapCreateBrowserRouter(createBrowserRouter);

// const router = createBrowserRouter([
const router = sentryCreateBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" />,
  },
  {
    path: "404",
    element: <PageNotFound />,
  },
  ...authRoutes,
  // PROTECTED ROUTES
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <GualletAppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      ...accountRoutes,
      // ...transactionRoutes,
      ...categoriesRoutes,
      // ...reportsRoutes,
      // ...settingsRoutes,
    ],
  },
  {
    path: "*",
    element: <Navigate to="/404" replace={true} />,
  },
]);

export default function RootRouter() {
  return <RouterProvider router={router} />;
}
