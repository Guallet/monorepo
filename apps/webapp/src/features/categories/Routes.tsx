import { RouteObject } from "react-router-dom";
import { CategoriesPage, loader as categoriesLoader } from "./CategoriesPage";
import { rulesRoutes } from "./rules/Routes";

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
      ...rulesRoutes,
    ],
  },
];
