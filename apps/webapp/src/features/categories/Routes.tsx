import { RouteObject } from "react-router-dom";
import { CategoriesPage, loader as categoriesLoader } from "./CategoriesPage";
import { RulesPage, loader as rulesLoader } from "./rules/RulesPage";

export const categoriesRoutes: RouteObject[] = [
  {
    path: "categories",
    errorElement: <div>Error loading categories</div>,
    children: [
      {
        index: true,
        element: <CategoriesPage />,
        loader: categoriesLoader,
      },
      {
        path: "rules",
        element: <RulesPage />,
        loader: rulesLoader,
      },
    ],
  },
];
