import { RouteObject } from "react-router-dom";
import {
  ConnectionsPage,
  loader as connectionsLoader,
} from "./ConnectionsPage";
import {
  AddConnectionPage,
  loader as addConnectionLoader,
} from "./AddConnectionPage";

export const connectionsRoutes: RouteObject[] = [
  {
    path: "connections",
    errorElement: <div>Error loading settings</div>,
    children: [
      {
        index: true,
        element: <ConnectionsPage />,
        loader: connectionsLoader,
      },
      {
        path: "add",
        element: <AddConnectionPage />,
        loader: addConnectionLoader,
      },
    ],
  },
];
