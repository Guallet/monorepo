import { RouteObject } from "react-router-dom";
import { AuthCallbackPage } from "./AuthCallbackPage";
import { LoginPage } from "./LoginPage";
import { LogoutPage, loader as logoutLoader } from "./LogoutPage";

export const authRoutes: RouteObject[] = [
  {
    path: "login",
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
      {
        path: "callback",
        element: <AuthCallbackPage />,
      },
    ],
  },
  {
    path: "logout",
    element: <LogoutPage />,
    loader: logoutLoader,
  },
];
