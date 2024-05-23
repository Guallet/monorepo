import { useCategory } from "@guallet/api-react";
import { CategoryIconName, GualletIcon } from "../GualletIcon/GualletIcon";

const unknownIcon: CategoryIconName = "question";

interface CategoryIconProps {
  categoryId: string | null;
}
export function CategoryIcon({ categoryId }: CategoryIconProps) {
  return categoryId === null ? (
    <GualletIcon iconName={unknownIcon} />
  ) : (
    <GualletCategoryIcon categoryId={categoryId} />
  );
}

<<<<<<< HEAD
function GualletCategoryIcon({ categoryId }: Readonly<{ categoryId: string }>) {
=======
function GualletCategoryIcon({ categoryId }: { categoryId: string }) {
>>>>>>> ba84897 (Develop into Main (#19))
  const { category } = useCategory(categoryId);

  if (category) {
    return <GualletIcon iconName={category.icon} iconColor={category.colour} />;
  } else {
    return <GualletIcon iconName={unknownIcon} />;
  }
}
