import { RouteObject } from "react-router-dom";
import { AccountsPage, loader as accountLoader } from "./AccountsPage";
import {
  AddAccountPage,
  action as addAccountAction,
} from "./AddAccount/AddAccountPage";
import {
  AccountDetailsPage,
  loader as accountDetailsLoader,
} from "./AccountDetails/AccountDetailsPage";
import {
  EditAccountPage,
  loader as editAccountLoader,
  action as editAccountAction,
} from "./EditAccount/EditAccountPage";

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
        path: ":id/edit",
        index: true,
        element: <EditAccountPage />,
        loader: editAccountLoader,
        action: editAccountAction,
      },
      {
        path: "add",
        element: <AddAccountPage />,
        action: addAccountAction,
      },
    ],
  },
];
