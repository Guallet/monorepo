import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  IconChevronDown,
  IconChevronRight,
  IconEdit,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { useState } from 'react';
import { AppCategory } from '../../models/Category';
import { GualletIcon } from '@/components/GualletIcon/GualletIcon';
import { CategoryAvatar } from '@/components/Categories/CategoryAvatar';

interface Props {
  category: AppCategory;
  onAddSubcategory: (parent: AppCategory) => void;
  onEdit: (category: AppCategory) => void;
  onDelete: (category: AppCategory) => void;
}

interface SubCategoryItemProps {
  category: AppCategory;
  onEdit: () => void;
  onDelete: () => void;
}

function SubCategoryItem({ category, onEdit, onDelete }: SubCategoryItemProps) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border p-2">
      <div className="flex min-w-0 items-center gap-2">
        <CategoryAvatar categoryId={category.id} color={category.colour} />
        <span className="truncate text-sm">{category.name}</span>
      </div>
      <div className="flex items-center gap-1">
        <Button type="button" variant="ghost" size="icon" onClick={onEdit}>
          <IconEdit size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <IconTrash size={16} />
        </Button>
      </div>
    </div>
  );
}

export function CategoriesListItem({
  category,
  onAddSubcategory,
  onEdit,
  onDelete,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="p-3">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          onClick={() => {
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-muted">
            <GualletIcon iconName={category.icon} iconColor={category.colour} />
          </span>
          <span className="truncate font-medium">{category.name}</span>
        </button>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              onEdit(category);
            }}
          >
            <IconEdit size={16} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => {
              onDelete(category);
            }}
          >
            <IconTrash size={16} />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-2 pl-6">
          {category.subCategories.map((subCategory) => (
            <SubCategoryItem
              key={subCategory.id}
              category={subCategory}
              onEdit={() => {
                onEdit(subCategory);
              }}
              onDelete={() => {
                onDelete(subCategory);
              }}
            />
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => {
              onAddSubcategory(category);
            }}
          >
            <IconPlus size={16} />
            Add new sub-category
          </Button>
        </div>
      )}
    </Card>
  );
}