import { AppSection } from "@/components/Cards/AppSection";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CategoryDto } from "@guallet/api-client";
import { AppCategory } from "@guallet/api-react";
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
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? <IconChevronDown /> : <IconChevronRight />}
          </Button>

          <div className="min-w-0 flex-1">
            <AppCategoryRow
              category={category}
              onClick={(selectedCategory) => {
                if (onCategorySelected) {
                  onCategorySelected(selectedCategory);
                }
              }}
            />
          </div>
        </div>

      {isExpanded && (
        <div className="space-y-2 pl-11">
          {category.subCategories.length > 0 && (
            <p className="text-xs text-muted-foreground">Sub-categories</p>
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
          <Separator />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (onAddSubcategoryClick) {
                onAddSubcategoryClick(category);
              }
            }}
          >
            Add sub-category
          </Button>
        </div>
      )}
      </div>
    </AppSection>
  );
}
