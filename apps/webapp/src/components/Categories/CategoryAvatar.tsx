import { Avatar, AvatarProps } from "@mantine/core";
import { CategoryIcon } from "./CategoryIcon";

interface CategoryAvatarProps extends AvatarProps {
  categoryId: string | null;
}

export function CategoryAvatar({ categoryId, ...props }: CategoryAvatarProps) {
  return (
    <Avatar color="blue" radius="sm" {...props}>
      <CategoryIcon categoryId={categoryId} />
    </Avatar>
  );
}
