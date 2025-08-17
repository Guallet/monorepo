import { useCategories, useGroupedCategories } from "@guallet/api-react";
import { CategoryDto } from "@guallet/api-client";

interface CategoryMultiSelectProps {
  selectedCategories: CategoryDto[];
  onSelectionChanged: (selectedCategories: CategoryDto[]) => void;
  required?: boolean;
}

export function CategoryMultiSelect({
  selectedCategories,
  onSelectionChanged,
  required = false,
}: CategoryMultiSelectProps) {
  const { categories } = useCategories();
  const { groupedCategories } = useGroupedCategories();
  return "This is the CategoryMultiSelect component";
}
