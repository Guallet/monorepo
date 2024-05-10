import { createFileRoute } from "@tanstack/react-router";
import {
  Accordion,
  ActionIcon,
  Badge,
  Button,
  Divider,
  Group,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { AppCategory, useGroupedCategories } from "@guallet/api-react";
import { AppScreen } from "@/components/Layout/AppScreen";
import { AppSection } from "@/components/Cards/AppSection";
import { CategoryAvatar } from "@/components/Categories/CategoryAvatar";
import { useState } from "react";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";

export const Route = createFileRoute("/_app/categories/")({
  component: CategoriesPage,
});

function CategoriesPage() {
  const { categories, isLoading } = useGroupedCategories();

  return (
    <AppScreen isLoading={isLoading}>
      <Stack>
        <Button onClick={() => console.log("Add new parent category")}>
          Add new parent category
        </Button>
        <Accordion>
          {categories.map((category) => (
            <CategorySection key={category.id} category={category} />
          ))}
        </Accordion>
      </Stack>
    </AppScreen>
  );
}

function CategorySection({ category }: { category: AppCategory }) {
  const [isExpanded, setExpanded] = useState(false);

  return (
    <AppSection title="">
      <Group>
        {isExpanded ? (
          <ActionIcon
            variant="transparent"
            onClick={() => {
              setExpanded(false);
            }}
          >
            <IconChevronDown />
          </ActionIcon>
        ) : (
          <ActionIcon
            variant="transparent"
            onClick={() => {
              setExpanded(true);
            }}
          >
            <IconChevronRight />
          </ActionIcon>
        )}

        <CategoryAvatar categoryId={category.id} color={category.colour} />
        <Text>{category.name}</Text>
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
      {isExpanded && (
        <Stack>
          {category.subCategories.length > 0 && (
            <Divider label="Sub-categories" labelPosition="center" />
          )}
          {category.subCategories.map((subCategory) => (
            <Group key={subCategory.id}>
              <CategoryAvatar categoryId={subCategory.id} />
              <Text>{subCategory.name}</Text>
            </Group>
          ))}
          <Button variant="outline">Add sub-category</Button>
        </Stack>
      )}
    </AppSection>
  );
}
