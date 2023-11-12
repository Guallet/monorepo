import React, { useState } from "react";
import { AppCategory, Category } from "../../categories/models/Category";
import {
  Button,
  Flex,
  List,
  TextInput,
  Text,
  Group,
  Stack,
} from "@mantine/core";
import { IconPackage, IconSearch } from "@tabler/icons-react";

interface IProps {
  categories: Category[];
  onSelectCategory: (category: Category) => void;
}

function mapCategoriesToAppCategories(categories: Category[]) {
  const roots = categories
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((x) => x.parentId === null || x.parentId === undefined)
    .map((x: Category) => {
      const appCategory: AppCategory = {
        id: x.id,
        name: x.name,
        icon: x.icon,
        colour: x.colour,
        subCategories: [],
      };
      return appCategory;
    });

  for (const parent of roots) {
    const children = categories
      .filter((x) => x.parentId === parent.id)
      .map((x: Category) => {
        const appCategory: AppCategory = {
          id: x.id,
          name: x.name,
          icon: x.icon,
          colour: x.colour,
          subCategories: [],
        };

        return appCategory;
      });
    parent.subCategories = children;
  }

  return roots;
}

export function SelectCategoryModal({ categories, onSelectCategory }: IProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const nestedAppCategories = mapCategoriesToAppCategories(categories);

  return (
    <Flex direction="column">
      <TextInput
        placeholder="Search categories"
        leftSection={<IconSearch />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <List>
        {searchTerm !== ""
          ? filteredCategories.map((category) => (
              <CategoryListItem
                category={category}
                onSelectCategory={() => onSelectCategory(category)}
              />
            ))
          : nestedAppCategories.map((category) => {
              return (
                <RootCategoryListItem
                  category={category}
                  onSelectCategory={(x) => {
                    onSelectCategory({
                      id: x.id,
                      name: x.name,
                      icon: x.icon,
                      colour: x.colour,
                      parentId: null,
                    });
                  }}
                />
              );
            })}
      </List>
      {filteredCategories.length === 0 && (
        <Button>Add {searchTerm} as new category</Button>
      )}
    </Flex>
  );
}

interface CategoryListItemProps {
  category: Category;
  onSelectCategory: (category: Category) => void;
}
function CategoryListItem({
  category,
  onSelectCategory,
}: CategoryListItemProps) {
  return (
    <Group key={category.id} onClick={() => onSelectCategory}>
      <Text>
        [{category.icon}]{category.name}
      </Text>
    </Group>
  );
}

interface RootCategoryListItemProps {
  category: AppCategory;
  onSelectCategory: (category: AppCategory) => void;
}
function RootCategoryListItem({
  category,
  onSelectCategory,
}: RootCategoryListItemProps) {
  return (
    <Stack key={category.id}>
      <Group onClick={() => onSelectCategory(category)}>
        <IconPackage color={category.colour} />
        <Text>{category.name}</Text>
      </Group>
      <Stack
        style={{
          marginLeft: 50,
        }}
      >
        {category.subCategories.map((subCategory) => {
          return (
            <Group
              key={subCategory.id}
              onClick={() => onSelectCategory(subCategory)}
            >
              <IconSearch color={subCategory.colour} />
              <Text>{subCategory.name}</Text>
            </Group>
          );
        })}
      </Stack>
    </Stack>
  );
}
