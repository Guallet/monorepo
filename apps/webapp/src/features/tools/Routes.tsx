import { RouteObject } from "react-router-dom";
import { MortgageCalculator } from "./calculators/MortgageCalculator";

export const toolsRoutes: RouteObject[] = [
  {
    path: "tools",
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
