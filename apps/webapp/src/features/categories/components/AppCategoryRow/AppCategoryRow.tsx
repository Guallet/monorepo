import { AppCategory } from "@guallet/api-react";
import { CategoryRow } from "../CategoryRow/CategoryRow";

interface AppCategoryRowProps {
  category: AppCategory;
  onClick?: (category: AppCategory) => void;
}
export function AppCategoryRow({
  category,
  onClick,
}: Readonly<AppCategoryRowProps>) {
  const subCategoriesCount = category.subCategories.length;
  const badgeLabel =
    subCategoriesCount === 0
      ? 'No subcategories'
      : `${subCategoriesCount} sub-categories`;

  return (
    <div className="flex w-full items-center gap-2">
      <div className="min-w-0 flex-1">
        <CategoryRow
          category={category}
          onClick={() => {
            if (onClick) {
              onClick(category);
            }
          }}
        />
      </div>
      <span
        className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-full border px-2 text-xs"
        title={badgeLabel}
      >
        {subCategoriesCount}
      </span>
    </div>
  );
}
