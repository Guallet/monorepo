import { RouteObject } from "react-router-dom";
import {
  CashFlowPage,
  loader as cashFlowLoader,
} from "./CashFlow/CashFlowPage";
import { ReportsPage } from "./ReportsPage";

export const reportsRoutes: RouteObject[] = [
  {
    path: "reports",
    errorElement: <div>Error loading reports</div>,
    children: [
      {
        index: true,
        element: <ReportsPage />,
      },
      {
        path: "cashflow",
        element: <CashFlowPage />,
        loader: cashFlowLoader,
      },
    ],
  },
];
