import { useCategories } from "@guallet/api-react";
import { CategoryDto } from "@guallet/api-client";
import {
  Input,
  Modal,
  Button,
  Stack,
  Group,
  TreeNodeData,
  useTree,
  Text,
  Tree,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { CategoryTreeNode } from "./CategoryTreeNode";
import { useIsMobile } from "@/utils/useIsMobile";
import { SearchBoxInput } from "@guallet/ui-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

interface CategoryMultiSelectProps
  extends React.ComponentProps<typeof Input.Wrapper> {
  selectedCategories: CategoryDto[];
  onSelectionChanged: (selectedCategories: CategoryDto[]) => void;
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

export function CategoryMultiSelect({
  selectedCategories,
  onSelectionChanged,
  ...props
}: Readonly<CategoryMultiSelectProps>) {
  const { t } = useTranslation();
  const { categories } = useCategories();
  const isMobile = useIsMobile();

  const [opened, { open, close }] = useDisclosure(false);
  const [filterQuery, setFilterQuery] = useState("");

  const tree = useTree({
    // initialExpandedState: getTreeExpandedState(data, "*"),
    initialCheckedState: selectedCategories.map((cat) => cat.id),
  });

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

  const inputValue = useMemo(() => {
    if (selectedCategories.length === 0) {
      // We don't want to return anything, so it falls back to the placeholder
      return undefined;
    }

    return t("components.categoryMultiSelect.input.value", {
      count: selectedCategories.length,
    });
  }, [selectedCategories, t]);

  return (
    <>
      <Input.Wrapper {...props}>
        <Input
          readOnly
          value={inputValue}
          onClick={open}
          placeholder={t(
            "components.categoryMultiSelect.input.placeholder",
            "Select categories"
          )}
          pointer={true}
        />
      </Input.Wrapper>
      <Modal
        opened={opened}
        onClose={close}
        title={
          <Text>
            {t(
              "components.categoryMultiSelect.modal.title",
              "Select Categories"
            )}
          </Text>
        }
        size="lg"
        fullScreen={isMobile}
      >
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
            expandOnClick={false}
            renderNode={CategoryTreeNode}
          />
        </Stack>
      </Modal>
    </>
  );
}
