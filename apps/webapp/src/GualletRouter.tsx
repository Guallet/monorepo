import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import { ProtectedRoute } from "./core/auth/ProtectedRoute";
import PageNotFound from "./components/PageNotFound/PageNotFound";
import { authRoutes } from "./features/auth/Routes";
import { DashboardPage } from "./features/dashboard/DashboardPage";

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
        {/* <GualletAppShell /> */}
        <Outlet />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      // ...accountRoutes,
      // ...transactionRoutes,
      // ...categoriesRoutes,
      // ...reportsRoutes,
      // ...settingsRoutes,
    ],
  },
  {
    path: "*",
    element: <Navigate to="/404" replace={true} />,
  },
]);

export default function GualletRouter() {
  return <RouterProvider router={router} />;
}
