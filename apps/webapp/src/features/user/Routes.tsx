import { RouteObject } from "react-router-dom";
import { UserDetailsPage, loader as userLoader } from "./UserDetailsPage";
import {
  EditUserPage,
  loader as editUserLoader,
  action as editUserAction,
} from "./EditUserPage";

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
        path: "edit",
        index: true,
        element: <EditUserPage />,
        loader: editUserLoader,
        action: editUserAction,
      },
    ],
  },
];
