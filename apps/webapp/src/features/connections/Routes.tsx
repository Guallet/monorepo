import { RouteObject } from "react-router-dom";
import {
  ConnectionsPage,
  loader as connectionsLoader,
} from "./ConnectionsPage";
import {
  AddConnectionPage,
  loader as addConnectionLoader,
} from "./AddConnectionPage";
import {
  AddConnectionCallbackPage,
  loader as addConnectionCallbackLoader,
} from "./AddConnectionCallbackPage";

export const connectionsRoutes: RouteObject[] = [
  {
    path: "connections",
    errorElement: <div>Error loading the open banking settings</div>,
    children: [
      {
        index: true,
        element: <ConnectionsPage />,
        loader: connectionsLoader,
      },
      {
        path: "connect",
        element: <AddConnectionPage />,
        loader: addConnectionLoader,
      },
      {
        path: "connect/callback",
        element: <AddConnectionCallbackPage />,
        loader: addConnectionCallbackLoader,
      },
    ],
  },
];
