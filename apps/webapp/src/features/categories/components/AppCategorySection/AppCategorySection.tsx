import { AppSection } from "@/components/Cards/AppSection";
import { CategoryDto } from "@guallet/api-client";
import { AppCategory } from "@guallet/api-react";
import { Group, ActionIcon, Stack, Divider, Button } from "@mantine/core";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import { useState } from "react";
import { AppCategoryRow } from "../AppCategoryRow/AppCategoryRow";
import { CategoryRow } from "../CategoryRow/CategoryRow";

interface AppCategorySectionProps {
  category: AppCategory;
  onCategorySelected?: (category: AppCategory | CategoryDto) => void;
  onAddSubcategoryClick?: (parentCategory: AppCategory) => void;
}

export function AppCategorySection({
  category,
  onCategorySelected,
  onAddSubcategoryClick,
}: Readonly<AppCategorySectionProps>) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <AppSection>
      <Group>
        {isExpanded ? (
          <ActionIcon
            variant="transparent"
            onClick={() => {
              setIsExpanded(false);
            }}
          >
            <IconChevronDown />
          </ActionIcon>
        ) : (
          <ActionIcon
            variant="transparent"
            onClick={() => {
              setIsExpanded(true);
            }}
          >
            <IconChevronRight />
          </ActionIcon>
        )}

        <AppCategoryRow
          category={category}
          onClick={(category) => {
            if (onCategorySelected) {
              onCategorySelected(category);
            }
          }}
        />
      </Group>
      {isExpanded && (
        <Stack>
          {category.subCategories.length > 0 && (
            <Divider label="Sub-categories" labelPosition="center" />
          )}
          {category.subCategories.map((subCategory) => (
            <CategoryRow
              key={subCategory.id}
              category={subCategory}
              onClick={(category) => {
                if (onCategorySelected) {
                  onCategorySelected(category);
                }
              }}
            />
          ))}
          <Button
            variant="outline"
            onClick={() => {
              if (onAddSubcategoryClick) {
                onAddSubcategoryClick(category);
              }
            }}
          >
            Add sub-category
          </Button>
        </Stack>
      )}
    </AppSection>
  );
}
