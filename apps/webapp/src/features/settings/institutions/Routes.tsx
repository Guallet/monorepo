import { RouteObject } from "react-router-dom";
import {
  InstitutionsPage,
  loader as institutionsLoader,
} from "./InstitutionsPage";

export const institutionsRoutes: RouteObject[] = [
  {
    path: "institutions",
    children: [
      {
        index: true,
        element: <InstitutionsPage />,
        loader: institutionsLoader,
      },
    ],
  },
];
