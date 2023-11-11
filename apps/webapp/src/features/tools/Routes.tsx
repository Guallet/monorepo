import { RouteObject } from "react-router-dom";
import { MortgageCalculator } from "./calculators/MortgageCalculator";

export const toolsRoutes: RouteObject[] = [
  {
    path: "tools",
    errorElement: <div>Error loading tools</div>,
    children: [
      {
        index: true,
        element: <MortgageCalculator />,
      },
      {
        path: "mortgage",
        element: <MortgageCalculator />,
      },
    ],
  },
];
