import { createFileRoute } from "@tanstack/react-router";

import { CategoryListScreen } from "@/features/categories/screens/CategoryListScreen";

export const Route = createFileRoute("/_app/categories/")({
  component: CategoriesPage,
});

function CategoriesPage() {
  return <CategoryListScreen />;
}
