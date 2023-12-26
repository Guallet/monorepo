import { RouteObject } from "react-router-dom";
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
