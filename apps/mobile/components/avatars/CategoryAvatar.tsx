import { useCategory } from '@guallet/api-react';
import { Avatar, type AvatarProps } from '@guallet/luna-mobile';
import { CategoryIcon } from '@guallet/luna-mobile/icons';

export interface CategoryAvatarProps extends Omit<AvatarProps, 'children'> {
  categoryId: string | null;
}

export function CategoryAvatar({
  categoryId,
  size = 'sm',
  radius = 'sm',
  variant = 'outline',
  accessibilityLabel,
  style,
  ...avatarProps
}: Readonly<CategoryAvatarProps>) {
  const { category } = useCategory(categoryId);

  return (
    <Avatar
      {...avatarProps}
      size={size}
      radius={radius}
      variant={variant}
      accessibilityLabel={
        accessibilityLabel ?? category?.name ?? 'Unknown category'
      }
      style={style}
    >
      <CategoryIcon name={category?.icon} color={category?.colour} />
    </Avatar>
  );
}
