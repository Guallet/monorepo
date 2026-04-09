import { Avatar, AvatarProps } from '@mantine/core';
import { CategoryIcon } from './CategoryIcon';

interface CategoryAvatarProps extends AvatarProps {
  categoryId: string | null;
}

export function CategoryAvatar({
  categoryId,
  ...props
}: Readonly<CategoryAvatarProps>) {
  return (
    <Avatar radius="sm" {...props} variant="outline">
      <CategoryIcon categoryId={categoryId} />
    </Avatar>
  );
}
