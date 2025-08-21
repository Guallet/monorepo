import { SearchBoxInput } from "@guallet/ui-react";
import {
  Text,
  Stack,
  Group,
  Button,
  Tree,
  useTree,
  getTreeExpandedState,
  TreeNodeData,
} from "@mantine/core";
import { CategoryTreeNode } from "./CategoryTreeNode";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCategories } from "@guallet/api-react";
import { CategoryDto } from "@guallet/api-client";

interface CategoryMultiSelectModalProps {
  selectedCategories: CategoryDto[];
  onSelectionChanged: (selectedCategories: CategoryDto[]) => void;
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

export function CategoryMultiSelectModal({
  selectedCategories,
  onSelectionChanged,
  close,
}: Readonly<CategoryMultiSelectModalProps>) {
  console.log("Rendering <CategoryMultiSelectModal />");

  const { t } = useTranslation();
  const { categories } = useCategories();
  const [filterQuery, setFilterQuery] = useState("");

  const onSubmitSelectedCategories = () => {
    const selectedNodes = tree.getCheckedNodes();
    const selectedCategories = selectedNodes
      .map((node) => categories.find((cat) => cat.id === node.value))
      .filter((category): category is CategoryDto => category !== undefined);

    onSelectionChanged(selectedCategories);
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

  const tree = useTree({
    initialExpandedState: getTreeExpandedState(filteredData, "*"),
    initialCheckedState: selectedCategories.map((cat) => cat.id),
  });

  return (
    <Stack>
      <Group mb="md">
        <Button variant="outline" onClick={() => tree.checkAllNodes()}>
          {t(
            "components.categoryMultiSelect.modal.checkAllButton.label",
            "Check all"
          )}
        </Button>
        <Button variant="outline" onClick={() => tree.uncheckAllNodes()}>
          {t(
            "components.categoryMultiSelect.modal.uncheckAllButton.label",
            "Uncheck all"
          )}
        </Button>
        <Button variant="outline" onClick={() => tree.expandAllNodes()}>
          {t(
            "components.categoryMultiSelect.modal.expandAllButton.label",
            "Expand all"
          )}
        </Button>
        <Button variant="outline" onClick={() => tree.collapseAllNodes()}>
          {t(
            "components.categoryMultiSelect.modal.collapseAllButton.label",
            "Collapse all"
          )}
        </Button>
      </Group>
      <Group justify="flex-end">
        <Button onClick={onSubmitSelectedCategories}>
          {t(
            "components.categoryMultiSelect.modal.selectButton.label",
            "Select categories"
          )}
        </Button>
      </Group>
      <SearchBoxInput
        placeholder={t(
          "components.categoryMultiSelect.modal.searchBox.placeholder",
          "Search categories"
        )}
        query={filterQuery}
        debounceWait={350}
        onSearchQueryChanged={(value) => setFilterQuery(value)}
      />
      {filteredData.length === 0 && (
        <Text c="dimmed" size="sm">
          {t(
            "components.categoryMultiSelect.modal.searchBox.emptyResults",
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
        expandOnClick={true}
        renderNode={CategoryTreeNode}
      />
    </Stack>
  );
}
