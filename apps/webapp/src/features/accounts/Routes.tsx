import { RouteObject } from "react-router-dom";
import { AccountsPage, loader as accountLoader } from "./AccountsPage";
import { AddAccountPage, action as addAccountAction } from "./AddAccountPage";
import {
  AccountDetailsPage,
  loader as accountDetailsLoader,
} from "./AccountDetails/AccountDetailsPage";

export const accountRoutes: RouteObject[] = [
  {
    path: "accounts",
    errorElement: <div>Error loading accounts</div>,
    children: [
      {
        index: true,
        element: <AccountsPage />,
        loader: accountLoader,
      },
      {
        path: ":id",
        element: <AccountDetailsPage />,
        loader: accountDetailsLoader,
      },
      {
        path: "add",
        element: <AddAccountPage />,
        action: addAccountAction,
      },
    ],
  },
];
