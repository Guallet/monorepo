// import PageNotFound from "./components/PageNotFound/PageNotFound";
// import { authRoutes } from "./features/auth/Routes";
// import { DashboardPage } from "./features/dashboard/DashboardPage";
// import GualletAppShell from "./components/layout/GualletAppShell";
// import { accountRoutes } from "./features/accounts/Routes";
// import { categoriesRoutes } from "./features/categories/Routes";
// import { reportsRoutes } from "./features/reports/Routes";
// import { settingsRoutes } from "./features/settings/Routes";
// import { connectionsRoutes } from "./features/connections/Routes";
// import { AppErrorBoundary } from "./AppErrorBoundary";
// import { AppRoutes } from "./router/AppRoutes";

// import { SessionAuth } from "supertokens-auth-react/recipe/session";
// import { useMemo } from "react";
// import { DeleteAccountConfirmationPage } from "./features/user/DeleteAccountConfirmationPage";

// export default function RootRouter() {
//   const router = useMemo(() => {
//     return createBrowserRouter([
//       {
//         path: "/",
//         element: <Navigate to={AppRoutes.DASHBOARD} />,
//       },
//       {
//         path: "404",
//         element: <PageNotFound />,
//       },
//       ...authRoutes,
//       // This cannot be protected because the user needs to be deleted and logged out
//       {
//         path: "delete-confirmation",
//         index: true,
//         element: <DeleteAccountConfirmationPage />,
//       },
//       // PROTECTED ROUTES
//       {
//         path: "/",
//         // errorElement: <AppErrorBoundary />,
//         element: (
//           // <ProtectedRoute>
//           <SessionAuth>
//             <GualletAppShell />
//           </SessionAuth>
//           // </ProtectedRoute>
//         ),
//         children: [
//           {
//             path: "dashboard",
//             element: <DashboardPage />,
//           },
//           ...accountRoutes,
//           ...connectionsRoutes,
//           ...categoriesRoutes,
//           ...reportsRoutes,
//           ...settingsRoutes,
//         ],
//       },
//       {
//         path: "*",
//         element: <Navigate to={AppRoutes.NOT_FOUND} replace={true} />,
//       },
//     ]);
//   }, []);
//   return <RouterProvider router={router} />;
// }
