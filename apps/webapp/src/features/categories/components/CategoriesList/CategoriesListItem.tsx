import {
  Accordion,
  ActionIcon,
  Group,
  Box,
  Divider,
  Menu,
  Stack,
  Center,
  Text,
  Avatar,
} from "@mantine/core";
import { IconDots, IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { AppCategory } from "../../models/Category";
import { GualletIcon } from "@/components/GualletIcon/GualletIcon";
import { CategoryAvatar } from "@/components/Categories/CategoryAvatar";

interface HeaderProps {
  title: string;
  iconName: string;
  iconColour: string;
  onEdit: () => void;
  onDelete: () => void;
}

function ItemHeader({
  title,
  iconName,
  iconColour,
  onEdit,
  onDelete,
}: HeaderProps) {
  const [menuOpened, setMenuOpened] = useState(false);

  return (
    <Center>
      <Accordion.Control>
        <Group>
          <Avatar color="blue" radius="sm">
            <GualletIcon iconName={iconName} iconColor={iconColour} />
          </Avatar>
          <Text>{title}</Text>
        </Group>
      </Accordion.Control>
      <Menu
        opened={menuOpened}
        onChange={setMenuOpened}
        trigger="hover"
        openDelay={100}
        closeDelay={300}
        shadow="md"
      >
        <Menu.Target>
          <ActionIcon
            size="lg"
            variant="subtle"
            color="gray"
            onClick={() => {
              setMenuOpened(!menuOpened);
            }}
          >
            <IconDots size="1rem" />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item
            leftSection={<IconEdit size={14} />}
            onClick={() => {
              onEdit();
            }}
          >
            Edit
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={14} />}
            onClick={() => {
              onDelete();
            }}
          >
            Delete category
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Center>
  );
}
interface AddSubCategoryRowItemProps {
  onRowClick: () => void;
}

function AddSubCategoryRowItem({ onRowClick }: AddSubCategoryRowItemProps) {
  return (
    <Box
      style={() => ({
        cursor: "pointer",
      })}
      onClick={() => onRowClick()}
    >
      <Group>
        <IconPlus size={16} color="grey" />
        Add new sub-category
      </Group>
    </Box>
  );
}
interface SubCategoryItemProps {
  category: AppCategory;
  onEdit: () => void;
  onDelete: () => void;
}

function SubCategoryItem({ category, onEdit, onDelete }: SubCategoryItemProps) {
  const [menuOpened, setMenuOpened] = useState(false);

  return (
    <Group style={{ marginLeft: "4em" }}>
      <CategoryAvatar categoryId={category.id} />
      <Text>{category.name}</Text>
      <Menu
        opened={menuOpened}
        onChange={setMenuOpened}
        trigger="hover"
        openDelay={100}
        closeDelay={300}
        shadow="md"
      >
        <Menu.Target>
          <ActionIcon
            size="lg"
            variant="subtle"
            color="gray"
            onClick={() => {
              setMenuOpened(!menuOpened);
            }}
          >
            <IconDots size={16} />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item
            leftSection={<IconEdit size={14} />}
            onClick={() => {
              onEdit();
            }}
          >
            Edit
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={14} />}
            onClick={() => {
              onDelete();
            }}
          >
            Delete
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}

interface Props {
  category: AppCategory;
  onAddSubcategory: (parent: AppCategory) => void;
  onEdit: (category: AppCategory) => void;
  onDelete: (category: AppCategory) => void;
}

export function CategoriesListItem({
  category,
  onAddSubcategory,
  onEdit,
  onDelete,
}: Props) {
  return (
    <>
      <Accordion variant="separated" chevronPosition="left">
        <Accordion.Item value={category.name}>
          <ItemHeader
            title={category.name}
            onEdit={() => onEdit(category)}
            onDelete={() => onDelete(category)}
            iconName={category.icon}
            iconColour={category.colour}
          />
          <Accordion.Panel>
            <Stack>
              {category.subCategories.map((subCategory) => (
                <SubCategoryItem
                  key={subCategory.id}
                  category={subCategory}
                  onEdit={() => onEdit(subCategory)}
                  onDelete={() => onDelete(subCategory)}
                />
              ))}
              <Divider />
              <AddSubCategoryRowItem
                onRowClick={() => {
                  onAddSubcategory(category);
                }}
              />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </>
  );
}
