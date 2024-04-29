import { AppCategory, Category } from "../../models/Category";
import { CategoriesListItem } from "./CategoriesListItem";

interface Props {
  categories: Category[];
  onAddSubcategory: (parentCategory: AppCategory) => void;
  onEdit: (category: AppCategory) => void;
  onDelete: (category: AppCategory) => void;
}

export function CategoriesList({
  categories,
  onEdit,
  onDelete,
  onAddSubcategory,
}: Props) {
  const roots = categories
    .filter((x) => x.parentId === null || x.parentId === undefined)
    .map((x: Category) => {
      const appCategory: AppCategory = {
        id: x.id,
        name: x.name,
        icon: x.icon,
        colour: x.colour,
        subCategories: [],
      };
      return appCategory;
    });

  for (const parent of roots) {
    const children = categories
      .filter((x) => x.parentId === parent.id)
      .map((x: Category) => {
        const appCategory: AppCategory = {
          id: x.id,
          name: x.name,
          icon: x.icon,
          colour: x.colour,
          subCategories: [],
        };

        return appCategory;
      });
    parent.subCategories = children;
  }

  return (
    <>
      {roots.map((category) => (
        <CategoriesListItem
          key={category.id}
          category={category}
          onAddSubcategory={(parent) => {
            onAddSubcategory(parent);
          }}
          onEdit={(x) => {
            onEdit(x);
          }}
          onDelete={(x) => {
            onDelete(x);
          }}
        />
      ))}
    </>
  );
}
