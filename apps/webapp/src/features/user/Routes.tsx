import { RouteObject } from "react-router-dom";
import { UserDetailsPage, loader as userLoader } from "./UserDetailsPage";
import {
  EditUserPage,
  loader as editUserLoader,
  action as editUserAction,
} from "./EditUserPage";
import {
  RegisterUserPage,
  loader as registerUserLoader,
  action as registerUserAction,
} from "./RegisterUserPage";

export const userProfileRoutes: RouteObject[] = [
  {
    path: "user",
    children: [
      {
        index: true,
        element: <UserDetailsPage />,
        loader: userLoader,
      },
      {
        path: "register",
        element: <RegisterUserPage />,
        loader: registerUserLoader,
        action: registerUserAction,
      },
      {
        path: "edit",
        index: true,
        element: <EditUserPage />,
        loader: editUserLoader,
        action: editUserAction,
      },
    ],
  },
];
