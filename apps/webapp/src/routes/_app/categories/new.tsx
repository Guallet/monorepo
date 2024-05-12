import { AppScreen } from "@/components/Layout/AppScreen";
import { useCategories, useCategory } from "@guallet/api-react";
import { Stack, Text } from "@mantine/core";
import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

const addCategorySearchSchema = z.object({
  parent: z.string().optional(),
});

type AddCategorySearchSchema = z.infer<typeof addCategorySearchSchema>;

export const Route = createFileRoute("/_app/categories/new")({
  component: AddCategoryPage,
  validateSearch: addCategorySearchSchema,
});

function AddCategoryPage() {
  //   const navigation = useNavigate();

  const { parent } = Route.useSearch();
  const isSubcategory = parent !== undefined;
  const { category, isLoading } = useCategory(parent ?? null);

  if (isLoading === false && category === null) {
    // Parent category not found
    notFound();
  }

  return (
    <AppScreen isLoading={isLoading}>
      <Stack>
        {isSubcategory ? (
          <Text>Adding a new subcategory to {category?.name}</Text>
        ) : (
          <Text>Adding a new parent category</Text>
        )}
      </Stack>
    </AppScreen>
  );
}
