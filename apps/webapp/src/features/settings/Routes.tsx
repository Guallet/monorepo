import { RouteObject } from "react-router-dom";
import { SettingsPage } from "./SettingsPage";
import { institutionsRoutes } from "./institutions/Routes";

export const settingsRoutes: RouteObject[] = [
  {
    path: "settings",
    errorElement: <div>Error loading settings</div>,
    children: [
      {
        index: true,
        element: <SettingsPage />,
      },
      ...institutionsRoutes,
    ],
  },
];
