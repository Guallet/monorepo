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

import { SessionAuth } from "supertokens-auth-react/recipe/session";
import * as reactRouterDom from "react-router-dom";
import { getSuperTokensRoutesForReactRouterDom } from "supertokens-auth-react/ui";
import { ThirdPartyPasswordlessPreBuiltUI } from "supertokens-auth-react/recipe/thirdpartypasswordless/prebuiltui";

export default function RootRouter() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Navigate to={AppRoutes.DASHBOARD} />,
    },
    {
      path: "404",
      element: <PageNotFound />,
    },
    // Supertokens Login Routes
    ...getSuperTokensRoutesForReactRouterDom(reactRouterDom, [
      ThirdPartyPasswordlessPreBuiltUI,
    ]).map((r) => r.props),
    ...authRoutes,
    // PROTECTED ROUTES
    {
      path: "/",
      errorElement: <AppErrorBoundary />,
      element: (
        // <ProtectedRoute>
        <SessionAuth>
          <GualletAppShell />
        </SessionAuth>
        // </ProtectedRoute>
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
  return <RouterProvider router={router} />;
}
