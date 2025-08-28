import { SearchBoxInput } from "@guallet/ui-react";
import {
  Text,
  Stack,
  Group,
  Tree,
  useTree,
  getTreeExpandedState,
  TreeNodeData,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCategories } from "@guallet/api-react";
import { CategoryDto } from "@guallet/api-client";
import {
  IconChevronDown,
  IconChevronsDown,
  IconChevronsUp,
} from "@tabler/icons-react";
import { CategoryIcon } from "@/components/Categories/CategoryIcon";

interface CategoryPickerModalProps {
  selectedCategory: CategoryDto | null;
  onSelectionChanged: (selectedCategory: CategoryDto) => void;
  close: () => void;
}

function mapCategoriesToTreeData(categories: CategoryDto[]): TreeNodeData[] {
  const rootCategories = categories.filter((category) => !category.parentId);

  const data: TreeNodeData[] = rootCategories.map((category) => {
    const subcategories = categories.filter(
      (cat) => cat.parentId === category.id
    );

    return {
      value: category.id,
      label: category.name,
      ...(subcategories && {
        children: subcategories.map((sub) => ({
          value: sub.id,
          label: sub.name,
        })),
      }),
    } as TreeNodeData;
  });
  return data;
}

export function CategoryPickerModal({
  selectedCategory,
  onSelectionChanged,
  close,
}: Readonly<CategoryPickerModalProps>) {
  const { t } = useTranslation();
  const { categories } = useCategories();
  const [filterQuery, setFilterQuery] = useState("");

  const onCategorySelected = (category: CategoryDto) => {
    onSelectionChanged(category);
    close();
  };

  const filteredData = useMemo(() => {
    if (filterQuery.trim() === "") {
      return mapCategoriesToTreeData(categories);
    } else {
      const filteredCategories = categories.filter((item: CategoryDto) => {
        const json = JSON.stringify(item.name);
        return json.toLowerCase().includes(filterQuery.toLowerCase());
      });

      const missingParentCategories = [
        ...new Set(
          filteredCategories
            .map((item: CategoryDto) => {
              if (item.parentId) {
                return categories.find((cat) => cat.id === item.parentId);
              }
              return null;
            })
            .filter(
              (item): item is CategoryDto => item !== null && item !== undefined
            )
        ),
      ];

      const allCategories = [...filteredCategories, ...missingParentCategories];

      return mapCategoriesToTreeData(allCategories);
    }
  }, [filterQuery, categories]);

  // TODO: There is a known issue with re-rendering the tree when the data changes
  // https://github.com/mantinedev/mantine/issues/7266
  const tree = useTree({
    initialExpandedState: getTreeExpandedState(
      mapCategoriesToTreeData(categories),
      "*"
    ),
  });

  return (
    <Stack>
      <Group mb="md">
        <SearchBoxInput
          style={{ flexGrow: 1 }}
          placeholder={t(
            "components.categoryPicker.modal.searchBox.placeholder",
            "Search categories"
          )}
          query={filterQuery}
          debounceWait={350}
          onSearchQueryChanged={(value) => setFilterQuery(value)}
        />
        <Tooltip
          label={t(
            "components.categoryPicker.modal.expandAllButton.label",
            "Expand all"
          )}
        >
          <ActionIcon
            variant="outline"
            onClick={() => {
              tree.expandAllNodes();
            }}
          >
            <IconChevronsDown />
          </ActionIcon>
        </Tooltip>

        <Tooltip
          label={t(
            "components.categoryPicker.modal.collapseAllButton.label",
            "Collapse all"
          )}
        >
          <ActionIcon
            variant="outline"
            onClick={() => {
              tree.collapseAllNodes();
            }}
          >
            <IconChevronsUp />
          </ActionIcon>
        </Tooltip>
      </Group>

      {filteredData.length === 0 && (
        <Text c="dimmed" size="sm">
          {t(
            "components.categoryPicker.modal.searchBox.emptyResults",
            "No categories found"
          )}
        </Text>
      )}
      <Tree
        style={{
          flexGrow: 1,
        }}
        tree={tree}
        data={filteredData}
        levelOffset={23}
        expandOnClick={false}
        renderNode={({ node, expanded, hasChildren, elementProps }) => (
          <Group gap="xs" {...elementProps}>
            <Group
              gap={5}
              onClick={() => {
                tree.toggleExpanded(node.value);

                const selectedCategory = categories.find(
                  (cat) => cat.id === node.value
                );

                if (selectedCategory) {
                  if (!hasChildren) {
                    onCategorySelected(selectedCategory);
                  }

                  if (hasChildren && expanded) {
                    onCategorySelected(selectedCategory);
                  }
                }
              }}
            >
              <CategoryIcon categoryId={node.value} />
              <Text>{node.label}</Text>

              {hasChildren && (
                <IconChevronDown
                  size={14}
                  style={{
                    transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              )}
            </Group>
          </Group>
        )}
      />
    </Stack>
  );
}
