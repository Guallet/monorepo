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
import { categoriesRoutes } from "./features/categories/Routes";
import { transactionsRoutes } from "./features/transactions/Routes";
import { toolsRoutes } from "./features/tools/Routes";
import { reportsRoutes } from "./features/reports/Routes";
import { settingsRoutes } from "./features/settings/Routes";
import { connectionsRoutes } from "./features/connections/Routes";
import { AppErrorBoundary } from "./AppErrorBoundary";
import { AppRoutes } from "./router/AppRoutes";
import { userProfileRoutes } from "./features/user/Routes";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to={AppRoutes.Auth.LOGIN} />,
  },
  {
    path: "404",
    element: <PageNotFound />,
  },
  ...authRoutes,
  // PROTECTED ROUTES
  {
    path: "/",
    errorElement: <AppErrorBoundary />,
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
      ...userProfileRoutes,
      ...accountRoutes,
      ...connectionsRoutes,
      ...transactionsRoutes,
      ...categoriesRoutes,
      ...reportsRoutes,
      ...settingsRoutes,
      ...toolsRoutes,
    ],
  },
  {
    path: "*",
    element: <Navigate to={AppRoutes.NOT_FOUND} replace={true} />,
  },
]);

export default function RootRouter() {
  return <RouterProvider router={router} />;
}
