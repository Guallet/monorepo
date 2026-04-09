import { useCategory } from "@guallet/api-react";
import { GualletIcon, GualletIconName } from "../GualletIcon/GualletIcon";

interface CategoryIconProps {
  categoryId: string | null;
  iconColor?: string;
}

const defaultIconName: GualletIconName = "IconQuestionMark";

export function CategoryIcon({ categoryId, iconColor }: CategoryIconProps) {
  return categoryId === null ? (
    <GualletIcon iconName={defaultIconName} iconColor={iconColor} />
  ) : (
    <GualletCategoryIcon categoryId={categoryId} iconColor={iconColor} />
  );
}

function GualletCategoryIcon({
  categoryId,
  iconColor,
}: Readonly<{ categoryId: string; iconColor?: string }>) {
  const { category } = useCategory(categoryId);

  if (category) {
    return (
      <GualletIcon
        iconName={category.icon}
        iconColor={iconColor ?? category.colour}
      />
    );
  } else {
    return <GualletIcon iconName={defaultIconName} iconColor={iconColor} />;
  }
}
