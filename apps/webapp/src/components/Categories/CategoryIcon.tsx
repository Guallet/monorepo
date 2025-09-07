import { useCategory } from "@guallet/api-react";
import { GualletIcon, GualletIconName } from "../GualletIcon/GualletIcon";

interface CategoryIconProps {
  categoryId: string | null;
}

const defaultIconName: GualletIconName = "IconQuestionMark";

export function CategoryIcon({ categoryId }: CategoryIconProps) {
  return categoryId === null ? (
    <GualletIcon iconName={defaultIconName} />
  ) : (
    <GualletCategoryIcon categoryId={categoryId} />
  );
}

function GualletCategoryIcon({ categoryId }: Readonly<{ categoryId: string }>) {
  const { category } = useCategory(categoryId);

  if (category) {
    return <GualletIcon iconName={category.icon} iconColor={category.colour} />;
  } else {
    return <GualletIcon iconName={defaultIconName} />;
  }
}
