import { RouteObject } from "react-router-dom";
import { AuthCallbackPage } from "./AuthCallbackPage";
import { LoginPage } from "./LoginPage";
import { LogoutPage, loader as logoutLoader } from "./LogoutPage";
import {
  RegisterUserPage,
  loader as registerUserLoader,
  action as registerUserAction,
} from "./RegisterUserPage";
import {
  SubscribeWaitingListPage,
  loader as subscribeUserLoader,
  action as subscribeUserAction,
} from "./SubscribeWaitingListPage";

export const authRoutes: RouteObject[] = [
  // {
  //   path: "login",
  //   children: [
  //     {
  //       index: true,
  //       element: <LoginPage />,
  //     },
  //     {
  //       path: "callback",
  //       element: <AuthCallbackPage />,
  //     },
  //   ],
  // },
  {
    path: "onboarding/register",
    element: <RegisterUserPage />,
    loader: registerUserLoader,
    action: registerUserAction,
  },
  {
    path: "onboarding/waiting-list",
    element: <SubscribeWaitingListPage />,
    loader: subscribeUserLoader,
    action: subscribeUserAction,
  },
  {
    path: "logout",
    element: <LogoutPage />,
    loader: logoutLoader,
  },
];
