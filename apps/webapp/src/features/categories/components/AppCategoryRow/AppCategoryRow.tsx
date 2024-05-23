import { AppCategory } from "@guallet/api-react";
import { Group, Badge, Tooltip } from "@mantine/core";
import { CategoryRow } from "../CategoryRow/CategoryRow";

interface AppCategoryRowProps {
  category: AppCategory;
  onClick?: (category: AppCategory) => void;
}
export function AppCategoryRow({ category, onClick }: AppCategoryRowProps) {
  return (
    <Group>
      <CategoryRow
        category={category}
        onClick={() => {
          if (onClick) {
            onClick(category);
          }
        }}
      />
      <Tooltip
        label={
          category.subCategories.length === 0
            ? "No subcategories"
            : `${category.subCategories.length} sub-categories`
        }
      >
        <Badge circle>{category.subCategories.length}</Badge>
      </Tooltip>
    </Group>
  );
}
