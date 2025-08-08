import { CategoriesScreen } from "@/features/categories/screens/CategoryDetailsScreen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/categories/$id")({
  component: CategoryDetailsPage,
});

function CategoryDetailsPage() {
  const { id } = Route.useParams();

  return <CategoriesScreen categoryId={id} />;
}
