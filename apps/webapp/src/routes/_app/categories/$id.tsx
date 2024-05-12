import { AppScreen } from "@/components/Layout/AppScreen";
import { CategoryRow } from "@/features/categories/components/CategoryRow/CategoryRow";
import { useCategory, useGroupedCategory } from "@guallet/api-react";
import { Stack, Button } from "@mantine/core";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_app/categories/$id")({
  component: CategoryDetailsPage,
});

function CategoryDetailsPage() {
  const { id } = Route.useParams();
  const { category, isLoading } = useGroupedCategory(id);
  const navigation = useNavigate();

  const isParent = category?.parentId === null ?? false;

  return (
    <AppScreen isLoading={isLoading}>
      <Stack>
        {category && <CategoryRow category={category} />}

        {isParent && (
          <Button
            onClick={() =>
              navigation({
                to: "/categories/new",
                search: { parent: id },
              })
            }
          >
            Add new sub category
          </Button>
        )}
      </Stack>
    </AppScreen>
  );
}
