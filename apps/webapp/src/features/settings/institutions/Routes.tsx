import { RouteObject } from "react-router-dom";
import {
  InstitutionsPage,
  loader as institutionsLoader,
} from "./InstitutionsPage";

export const institutionsRoutes: RouteObject[] = [
  {
    path: "institutions",
    errorElement: <div>Error loading institutions</div>,
    children: [
      {
        index: true,
        element: <InstitutionsPage />,
        loader: institutionsLoader,
      },
    ],
  },
];
