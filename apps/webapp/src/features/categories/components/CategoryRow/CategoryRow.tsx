import { CategoryAvatar } from '@/components/Categories/CategoryAvatar';
import { CategoryDto } from '@guallet/api-client';

interface CategoryRowProps {
  category: CategoryDto;
  onClick?: (category: CategoryDto) => void;
}

export function CategoryRow({ category, onClick }: Readonly<CategoryRowProps>) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-accent"
      onClick={() => {
        if (onClick) {
          onClick(category);
        }
      }}
    >
      <CategoryAvatar categoryId={category.id} color={category.colour} />
      <span>{category.name}</span>
    </button>
  );
}
