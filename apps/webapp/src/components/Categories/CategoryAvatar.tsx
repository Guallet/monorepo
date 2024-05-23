import { Avatar, AvatarProps } from "@mantine/core";
import { CategoryIcon } from "./CategoryIcon";

interface CategoryAvatarProps extends AvatarProps {
  categoryId: string | null;
}

<<<<<<< HEAD
export function CategoryAvatar({
  categoryId,
  ...props
}: Readonly<CategoryAvatarProps>) {
=======
export function CategoryAvatar({ categoryId, ...props }: CategoryAvatarProps) {
>>>>>>> ba84897 (Develop into Main (#19))
  return (
    <Avatar color="blue" radius="sm" {...props}>
      <CategoryIcon categoryId={categoryId} />
    </Avatar>
  );
}
