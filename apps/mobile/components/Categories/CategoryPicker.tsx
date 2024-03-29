import { BasePicker } from "../BasePicker";
import {
  AppCategory,
  useGroupedCategories,
} from "@/features/categories/useCategories";
import { CategoryRow } from "./CategoryRow";
import { Label, Spacing } from "@guallet/ui-react-native";

interface CategoryPickerProps {
  category: AppCategory | null;
  onCategorySelected: (category: AppCategory | null) => void;
}
export function CategoryPicker({
  category,
  onCategorySelected,
}: CategoryPickerProps) {
  const { categories } = useGroupedCategories();

  const flattenCategories = categories.reduce((acc, category) => {
    acc.push(category);
    if (category.subCategories.length > 0) {
      acc = acc.concat(category.subCategories);
    }
    return acc;
  }, [] as AppCategory[]);

  console.log("flattenCategories", flattenCategories);

  return (
    <BasePicker
      items={flattenCategories}
      selectedItem={category}
      placeholder="Select category"
      modalTitle="Select category"
      renderItem={(item: AppCategory) => {
        return (
          <CategoryRow
            category={item}
            style={{
              marginLeft:
                item.parentId === null ? Spacing.medium : Spacing.medium * 2,
            }}
          />
        );
      }}
      onItemSelected={(item) => {
        onCategorySelected(item);
      }}
      renderButton={(item: AppCategory) => {
        return <CategoryRow category={item} />;
      }}
    />
  );
}
