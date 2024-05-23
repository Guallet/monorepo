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
<<<<<<< HEAD
}: Readonly<AppCategorySectionProps>) {
  const [isExpanded, setIsExpanded] = useState(false);
=======
}: AppCategorySectionProps) {
  const [isExpanded, setExpanded] = useState(false);
>>>>>>> ba84897 (Develop into Main (#19))

  return (
    <AppSection>
      <Group>
        {isExpanded ? (
          <ActionIcon
            variant="transparent"
            onClick={() => {
<<<<<<< HEAD
              setIsExpanded(false);
=======
              setExpanded(false);
>>>>>>> ba84897 (Develop into Main (#19))
            }}
          >
            <IconChevronDown />
          </ActionIcon>
        ) : (
          <ActionIcon
            variant="transparent"
            onClick={() => {
<<<<<<< HEAD
              setIsExpanded(true);
=======
              setExpanded(true);
>>>>>>> ba84897 (Develop into Main (#19))
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
