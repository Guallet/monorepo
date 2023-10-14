import { AuthCallbackPage } from "./AuthCallbackPage";
import { LoginPage } from "./LoginPage";
import { LogoutPage } from "./LogoutPage";

export const authRoutes = [
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
  },
];
