import { RouteObject } from "react-router-dom";
import { RulesPage, loader as rulesLoader } from "./RulesPage";
import { CreateRulePage, loader as createRuleLoader } from "./CreateRulePage";

export const rulesRoutes: RouteObject[] = [
  {
    path: "rules",
    children: [
      {
        index: true,
        element: <RulesPage />,
        loader: rulesLoader,
      },
      {
        path: "create",
        element: <CreateRulePage />,
        loader: createRuleLoader,
      },
    ],
  },
];
