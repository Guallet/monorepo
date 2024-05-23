import { CategoryAvatar } from "@/components/Categories/CategoryAvatar";
import { CategoryDto } from "@guallet/api-client";
import { UnstyledButton, Group, Text } from "@mantine/core";

interface CategoryRowProps {
  category: CategoryDto;
  onClick?: (category: CategoryDto) => void;
}

<<<<<<< HEAD
export function CategoryRow({ category, onClick }: Readonly<CategoryRowProps>) {
=======
export function CategoryRow({ category, onClick }: CategoryRowProps) {
>>>>>>> ba84897 (Develop into Main (#19))
  return (
    <UnstyledButton
      onClick={() => {
        if (onClick) {
          onClick(category);
        }
      }}
    >
      <Group>
        <CategoryAvatar categoryId={category.id} color={category.colour} />
        <Text>{category.name}</Text>
      </Group>
    </UnstyledButton>
  );
}
