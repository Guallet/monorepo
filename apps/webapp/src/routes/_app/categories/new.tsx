import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AddCategoryScreen } from "@/features/categories/screens/AddCategoryScreen";

const addCategorySearchSchema = z.object({
  parent: z.string().optional(),
});

export const Route = createFileRoute("/_app/categories/new")({
  component: AddCategoryPage,
  validateSearch: addCategorySearchSchema,
});

function AddCategoryPage() {
  const { parent } = Route.useSearch();

  return <AddCategoryScreen parentId={parent} />;
}
