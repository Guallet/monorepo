import { RouteObject } from "react-router-dom";
import {
  TransactionsPage,
  loader as transactionsLoader,
} from "./TransactionsPage/TransactionsPage";

export const transactionsRoutes: RouteObject[] = [
  {
    path: "transactions",
    errorElement: <div>Error loading transaction</div>,
    children: [
      {
        index: true,
        element: <TransactionsPage />,
        loader: transactionsLoader,
      },
    ],
  },
];
