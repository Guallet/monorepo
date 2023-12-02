import { RouteObject } from "react-router-dom";
import { SettingsPage } from "./SettingsPage";

export const settingsRoutes: RouteObject[] = [
  {
    path: "settings",
    errorElement: <div>Error loading settings</div>,
    children: [
      {
        index: true,
        element: <SettingsPage />,
      },
    ],
  },
];
