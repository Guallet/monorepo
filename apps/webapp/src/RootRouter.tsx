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

const router = createBrowserRouter([
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
    element: <Navigate to="/404" replace={true} />,
  },
]);

export default function RootRouter() {
  return <RouterProvider router={router} />;
}
