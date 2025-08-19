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
import { useEffect, useState } from "react";

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

interface CategoryMultiSelectProps {
  selectedCategories: CategoryDto[];
  onSelectionChanged: (selectedCategories: CategoryDto[]) => void;
  required?: boolean;
}

export function CategoryMultiSelect({
  selectedCategories,
  onSelectionChanged,
  required = false,
}: Readonly<CategoryMultiSelectProps>) {
  const { categories } = useCategories();
  const isMobile = useIsMobile();

  const [opened, { open, close }] = useDisclosure(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [filteredData, setFilteredData] = useState<TreeNodeData[]>([]);

  const tree = useTree({
    // initialExpandedState: getTreeExpandedState(data, "*"),
    initialCheckedState: selectedCategories.map((cat) => cat.id),
  });

  useEffect(() => {
    if (filterQuery.trim() === "") {
      setFilteredData(mapCategoriesToTreeData(categories));
    } else {
      const filteredCategories = categories.filter((item: CategoryDto) => {
        // Poor's man filter: this way we filter all fields
        // and we can keep the parent nodes of the subcategories with matches
        const json = JSON.stringify(item);
        return json.toLowerCase().includes(filterQuery.toLowerCase());
      });
      const newTreeData = mapCategoriesToTreeData(filteredCategories);
      setFilteredData(newTreeData);
    }
  }, [filterQuery]);

  return (
    <>
      <Input.Wrapper label="Categories" required={required}>
        <Input
          readOnly
          value={`${selectedCategories.length} categories selected`}
          onClick={open}
          placeholder="Pick categories"
          style={{ cursor: "pointer" }}
        />
      </Input.Wrapper>
      <Modal
        opened={opened}
        onClose={close}
        title="Select Categories"
        size="lg"
        fullScreen={isMobile}
      >
        <Stack>
          <Group mb="md">
            <Button variant="outline" onClick={() => tree.checkAllNodes()}>
              Check all
            </Button>
            <Button variant="outline" onClick={() => tree.uncheckAllNodes()}>
              Uncheck all
            </Button>
            <Button variant="outline" onClick={() => tree.expandAllNodes()}>
              Expand all
            </Button>
            <Button variant="outline" onClick={() => tree.collapseAllNodes()}>
              Collapse all
            </Button>
          </Group>
          <Group justify="flex-end">
            <Button onClick={close}>Select categories</Button>
          </Group>
          <SearchBoxInput
            placeholder="Filter categories"
            query={filterQuery}
            onSearchQueryChanged={(value) => setFilterQuery(value)}
          />
          {filteredData.length === 0 && (
            <Text c="dimmed" size="sm">
              No categories found
            </Text>
          )}
          <Tree
            style={{
              flexGrow: 1,
            }}
            tree={tree}
            // data={data}
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
