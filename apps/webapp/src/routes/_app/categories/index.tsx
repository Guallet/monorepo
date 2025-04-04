import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button, Stack } from "@mantine/core";
import { useGroupedCategories } from "@guallet/api-react";

import { AppCategorySection } from "@/features/categories/components/AppCategorySection/AppCategorySection";
import { BaseScreen } from "@/components/Screens/BaseScreen";

export const Route = createFileRoute("/_app/categories/")({
  component: CategoriesPage,
});

function CategoriesPage() {
  const { categories, isLoading } = useGroupedCategories();
  const navigation = useNavigate();

  return (
    <BaseScreen isLoading={isLoading}>
      <Stack>
        <Button
          onClick={() =>
            navigation({
              to: "/categories/new",
            })
          }
        >
          Add new parent category
        </Button>
        {categories.map((category) => (
          <AppCategorySection
            key={category.id}
            category={category}
            onCategorySelected={(category) => {
              navigation({
                to: "/categories/$id",
                params: { id: category.id },
              });
            }}
            onAddSubcategoryClick={(parentCategory) => {
              navigation({
                to: "/categories/new",
                search: { parent: parentCategory.id },
              });
            }}
          />
        ))}
      </Stack>
    </BAses>
  );
}
