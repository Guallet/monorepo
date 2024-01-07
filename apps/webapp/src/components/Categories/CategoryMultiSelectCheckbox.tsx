import { AppCategory, Category } from "@/features/categories/models/Category";
import { SearchBoxInput } from "@guallet/ui-react";
import {
  Button,
  Checkbox,
  Collapse,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import {
  IconSearch,
  IconPackage,
  IconTool,
  IconSettings,
  IconFileUnknown,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

type AppCategoryWithSelection = {
  id: string;
  name: string;
  icon: string;
  colour: string;
  isSelected: boolean;
  subCategories: AppCategoryWithSelection[];
};

interface IProps {
  categories: Category[];
  selectedCategories: Category[];
  onSelectionChanged: (selectedCategories: Category[]) => void;
}

export function CategoryMultiSelectCheckbox({
  categories,
  selectedCategories,
  onSelectionChanged,
}: IProps) {
  const isMobile = useMediaQuery("(max-width: 50em)");
  const [opened, { open, close }] = useDisclosure(false);

  const [appCategories, setAppCategories] = useState<
    AppCategoryWithSelection[]
  >([]);

  useEffect(() => {
    // Init
    const nestedAppCategories = mapCategoriesToAppCategories(
      categories,
      selectedCategories
    );

    setAppCategories(nestedAppCategories);
  }, [categories, selectedCategories]);

  return (
    <>
      <Modal
        fullScreen={isMobile}
        opened={opened}
        onClose={close}
        title="Select categories"
        size="auto"
      >
        <SelectCategoryModal
          categories={appCategories}
          onClose={close}
          onSelectCompleted={(categories: Category[]) => {
            onSelectionChanged(categories);
            close();
          }}
        />
      </Modal>

      <Button variant="outline" onClick={open}>
        {selectedCategories.length > 0
          ? selectedCategories.length === 1
            ? selectedCategories[0].name
            : `${selectedCategories.length} categories selected`
          : "Select categories"}
      </Button>
    </>
  );
}

// Refactor from here
function mapCategoriesToAppCategories(
  categories: Category[],
  selectedCategories: Category[]
): AppCategoryWithSelection[] {
  const roots = categories
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((x) => x.parentId === null || x.parentId === undefined)
    .map((x: Category) => {
      const appCategory: AppCategoryWithSelection = {
        id: x.id,
        name: x.name,
        icon: x.icon,
        colour: x.colour,
        subCategories: [],
        isSelected: selectedCategories.some((y) => y.id === x.id),
      };
      return appCategory;
    });

  for (const parent of roots) {
    const children = categories
      .filter((x) => x.parentId === parent.id)
      .map((x: Category) => {
        const appCategory: AppCategoryWithSelection = {
          id: x.id,
          name: x.name,
          icon: x.icon,
          colour: x.colour,
          subCategories: [],
          isSelected: selectedCategories.some((y) => y.id === x.id),
        };

        return appCategory;
      });
    parent.subCategories = children;
  }

  return roots;
}

interface SelectCategoryModalProps {
  categories: AppCategoryWithSelection[];
  onClose: () => void;
  onSelectCompleted: (categories: Category[]) => void;
}

export function SelectCategoryModal({
  categories,
  onClose,
  onSelectCompleted,
}: SelectCategoryModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] =
    useState<AppCategoryWithSelection[]>(categories);

  const [filteredCategories, setFilteredCategories] =
    useState<AppCategoryWithSelection[]>(categories);

  useEffect(() => {
    const filteredCategories = selected.filter(
      (category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.subCategories.some((subCategory) =>
          subCategory.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
    setFilteredCategories(filteredCategories);
  }, [categories, searchTerm]);

  function deselectAll() {
    const allSelected = categories.map((x) => {
      return { ...x, isSelected: false };
    });
    setSelected(allSelected);
  }

  function selectAll() {
    const allSelected = categories.map((x) => {
      return { ...x, isSelected: true };
    });
    setSelected(allSelected);
  }

  function updateSelectedRootCategory(category: AppCategoryWithSelection) {
    const updatedList = categories.map((x) => {
      return {
        ...x,
        isSelected: x.id === category.id ? category.isSelected : x.isSelected,
        subCategories: x.subCategories.map((y) => {
          return { ...y, isSelected: category.isSelected };
        }),
      };
    });

    // const subcategories = categories.find(
    //   (x) => x.id === category.id
    // )?.subCategories;

    setSelected(updatedList);
  }

  function updateSelectedCategory(category: AppCategoryWithSelection) {
    const updatedList = categories.map((x) => {
      return {
        ...x,
        isSelected: x.id === category.id ? category.isSelected : x.isSelected,
      };
    });
    setSelected(updatedList);
  }

  return (
    <Stack w={"30em"}>
      <Group justify="flex-end">
        <Button
          variant="transparent"
          size="xs"
          onClick={() => {
            selectAll();
          }}
        >
          Select all
        </Button>
        <Button
          variant="transparent"
          size="xs"
          onClick={() => {
            deselectAll();
          }}
        >
          Deselect all
        </Button>
      </Group>
      <SearchBoxInput
        query={searchTerm}
        placeholder="Search categories..."
        onSearchQueryChanged={(query) => {
          setSearchTerm(query);
        }}
      />

      <ScrollArea.Autosize mah={300}>
        <Stack>
          {searchTerm !== ""
            ? filteredCategories.map((category) => (
                <CategoryListItem
                  key={category.id}
                  category={category}
                  onSelectCategory={(x) => {
                    //onSelectCategory(category)
                    x.isSelected = !x.isSelected;
                  }}
                />
              ))
            : selected.map((category) => {
                return (
                  <RootCategoryListItem
                    key={category.id}
                    category={category}
                    onRootCategorySelectionChanged={(
                      category: AppCategoryWithSelection
                    ) => {
                      updateSelectedRootCategory(category);
                    }}
                    onSubCategorySelectionChanged={(
                      category: AppCategoryWithSelection
                    ) => {
                      updateSelectedCategory(category);
                    }}
                  />
                );
              })}
        </Stack>
      </ScrollArea.Autosize>

      {filteredCategories.length === 0 && (
        <Text>No categories match the search criteria</Text>
      )}
      <Group grow>
        <Button
          onClick={() => {
            onClose();
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            const items = categories
              .filter((x) => x.isSelected)
              .map((x) => {
                const parent = categories.find((x) =>
                  x.subCategories.some((y) => y.id === x.id)
                );
                return {
                  id: x.id,
                  name: x.name,
                  icon: x.icon,
                  colour: x.colour,
                  parentId: parent?.id,
                } as Category;
              });
            onSelectCompleted(items);
          }}
        >
          Select
        </Button>
      </Group>
    </Stack>
  );
}

interface CategoryListItemProps {
  category: AppCategoryWithSelection;
  onSelectCategory: (category: AppCategoryWithSelection) => void;
}
function CategoryListItem({
  category,
  onSelectCategory,
}: CategoryListItemProps) {
  return (
    <Group key={category.id} onClick={() => onSelectCategory(category)}>
      <Text c={category.colour}>
        [{category.icon}]{category.name}
      </Text>
    </Group>
  );
}

interface RootCategoryListItemProps {
  category: AppCategoryWithSelection;

  onRootCategorySelectionChanged: (category: AppCategoryWithSelection) => void;
  onSubCategorySelectionChanged: (category: AppCategoryWithSelection) => void;
}
function RootCategoryListItem({
  category,
  onRootCategorySelectionChanged,
  onSubCategorySelectionChanged,
}: RootCategoryListItemProps) {
  const [opened, { toggle }] = useDisclosure(false);

  return (
    <Stack>
      {/* Root category */}
      <Group>
        <Checkbox
          checked={category.isSelected}
          onChange={(event) => {
            const isSelected = event.currentTarget.checked;
            //TODO: Select all subcategories
            onRootCategorySelectionChanged({ ...category, isSelected });
          }}
        />
        <Group
          style={{
            flex: 1,
          }}
          onClick={toggle}
        >
          <CategoryIcon category={category} />
          <Text
            style={{
              flex: 1,
            }}
          >
            {category.name}
          </Text>
          {opened ? <IconChevronUp /> : <IconChevronDown />}
        </Group>
      </Group>
      {/* Subcategories */}
      <Collapse in={opened}>
        <Stack
          style={{
            marginLeft: 50,
          }}
        >
          {category.subCategories.map((subCategory) => {
            return (
              <Group key={subCategory.id}>
                <Checkbox
                  onChange={(event) => {
                    const isSelected = event.currentTarget.checked;
                    onSubCategorySelectionChanged({
                      ...subCategory,
                      isSelected,
                    });
                  }}
                />
                <CategoryIcon category={subCategory} />
                <Text>{subCategory.name}</Text>
              </Group>
            );
          })}
        </Stack>
      </Collapse>
    </Stack>
  );
}

interface CategoryIconProps {
  //   name: "search" | "package" | "tools" | "settings" | "logout";
  //   name: string;
  //   color: string;
  category: AppCategory;
}

function CategoryIcon({ category }: CategoryIconProps) {
  const { name, colour } = category;
  switch (name) {
    case "search":
      return <IconSearch color={colour} />;
    case "package":
      return <IconPackage color={colour} />;
    case "tools":
      return <IconTool color={colour} />;
    case "settings":
      return <IconSettings color={colour} />;
    default:
      return <IconFileUnknown color={colour} />;
  }
  //   return <IconSearch color={color.colour} />;
}
