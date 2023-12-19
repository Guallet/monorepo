import { RouteObject } from "react-router-dom";
import {
  TransactionsPage,
  loader as transactionsLoader,
} from "./TransactionsPage/TransactionsPage";
import {
  TransactionsInboxPage,
  loader as inboxLoader,
} from "./Inbox/TransactionsInboxPage";

export const transactionsRoutes: RouteObject[] = [
  {
    path: "transactions",
    children: [
      {
        index: true,
        element: <TransactionsPage />,
        loader: transactionsLoader,
      },
      {
        path: "inbox",
        element: <TransactionsInboxPage />,
        loader: inboxLoader,
      },
    ],
  },
];
