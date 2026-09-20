import { useCategory } from '@guallet/api-react';
import {
  CategoryIcon as LunaCategoryIcon,
  categoryIconFallbackName,
} from '@guallet/luna-ui/icons';

interface CategoryIconProps {
  categoryId: string | null;
}

export function CategoryIcon({ categoryId }: CategoryIconProps) {
  return categoryId === null ? (
    <LunaCategoryIcon name={categoryIconFallbackName} />
  ) : (
    <GualletCategoryIcon categoryId={categoryId} />
  );
}

function GualletCategoryIcon({ categoryId }: Readonly<{ categoryId: string }>) {
  const { category } = useCategory(categoryId);

  if (category) {
    return <LunaCategoryIcon name={category.icon} color={category.colour} />;
  } else {
    return <LunaCategoryIcon name={categoryIconFallbackName} />;
  }
}
