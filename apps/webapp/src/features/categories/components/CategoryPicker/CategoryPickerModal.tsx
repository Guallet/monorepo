import { SearchBoxInput } from '@guallet/ui-react';
import {
  Text,
  Stack,
  Group,
  Button,
  Tree,
  useTree,
  getTreeExpandedState,
  TreeNodeData,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { CategoryTreeNode } from './CategoryTreeNode';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCategories } from '@guallet/api-react';
import { CategoryDto } from '@guallet/api-client';
import {
  IconChevronDown,
  IconChevronsDown,
  IconChevronsUp,
  IconDeselect,
  IconSelectAll,
} from '@tabler/icons-react';
import { CategoryIcon } from '@/components/Categories/CategoryIcon';

type CategoryPickerModalProps = (
  | {
      mode: 'single';
      selectedCategory: CategoryDto | null;
      onSelectionChanged: (category: CategoryDto) => void;
    }
  | {
      mode: 'multiple';
      selectedCategories: CategoryDto[];
      onSelectionChanged: (categories: CategoryDto[]) => void;
    }
) & { close: () => void };

function mapCategoriesToTreeData(categories: CategoryDto[]): TreeNodeData[] {
  const rootCategories = categories.filter((category) => !category.parentId);

  return rootCategories.map((category) => {
    const subcategories = categories.filter(
      (cat) => cat.parentId === category.id,
    );

    return {
      value: category.id,
      label: category.name,
      ...(subcategories.length > 0 && {
        children: subcategories.map((sub) => ({
          value: sub.id,
          label: sub.name,
        })),
      }),
    } as TreeNodeData;
  });
}

export function CategoryPickerModal(props: Readonly<CategoryPickerModalProps>) {
  const { mode, close } = props;
  const { t } = useTranslation();
  const { categories } = useCategories();
  const [filterQuery, setFilterQuery] = useState('');

  const filteredData = useMemo(() => {
    if (filterQuery.trim() === '') {
      return mapCategoriesToTreeData(categories);
    }

    const filteredCategories = categories.filter((item: CategoryDto) =>
      item.name.toLowerCase().includes(filterQuery.toLowerCase()),
    );

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
            (item): item is CategoryDto => item !== null && item !== undefined,
          ),
      ),
    ];

    return mapCategoriesToTreeData([
      ...filteredCategories,
      ...missingParentCategories,
    ]);
  }, [filterQuery, categories]);

  // TODO: There is a known issue with re-rendering the tree when the data changes
  // https://github.com/mantinedev/mantine/issues/7266
  const tree = useTree({
    initialExpandedState: getTreeExpandedState(
      mapCategoriesToTreeData(categories),
      '*',
    ),
    ...(mode === 'multiple' && {
      initialCheckedState: props.selectedCategories.map((cat) => cat.id),
    }),
  });

  const handleSubmitMultiple = () => {
    const checkedCategories = tree
      .getCheckedNodes()
      .map((node) => categories.find((cat) => cat.id === node.value))
      .filter((cat): cat is CategoryDto => cat !== undefined);

    (
      props as Extract<CategoryPickerModalProps, { mode: 'multiple' }>
    ).onSelectionChanged(checkedCategories);
    close();
  };

  return (
    <Stack>
      <Group wrap="nowrap" mb={mode === 'multiple' ? undefined : 'md'}>
        <SearchBoxInput
          style={{ flexGrow: 1 }}
          placeholder={t(
            'components.categoryPicker.modal.searchBox.placeholder',
            'Search categories',
          )}
          query={filterQuery}
          debounceWait={350}
          onSearchQueryChanged={(value) => setFilterQuery(value)}
        />

        {mode === 'multiple' && (
          <>
            <Tooltip
              label={t(
                'components.categoryPicker.modal.checkAllButton.label',
                'Check all',
              )}
            >
              <ActionIcon
                variant="outline"
                onClick={() => tree.checkAllNodes()}
              >
                <IconSelectAll />
              </ActionIcon>
            </Tooltip>

            <Tooltip
              label={t(
                'components.categoryPicker.modal.uncheckAllButton.label',
                'Uncheck all',
              )}
            >
              <ActionIcon
                variant="outline"
                onClick={() => tree.uncheckAllNodes()}
              >
                <IconDeselect />
              </ActionIcon>
            </Tooltip>
          </>
        )}

        <Tooltip
          label={t(
            'components.categoryPicker.modal.expandAllButton.label',
            'Expand all',
          )}
        >
          <ActionIcon variant="outline" onClick={() => tree.expandAllNodes()}>
            <IconChevronsDown />
          </ActionIcon>
        </Tooltip>

        <Tooltip
          label={t(
            'components.categoryPicker.modal.collapseAllButton.label',
            'Collapse all',
          )}
        >
          <ActionIcon variant="outline" onClick={() => tree.collapseAllNodes()}>
            <IconChevronsUp />
          </ActionIcon>
        </Tooltip>
      </Group>

      {mode === 'multiple' && (
        <Group justify="flex-end">
          <Button onClick={handleSubmitMultiple}>
            {t(
              'components.categoryPicker.modal.selectButton.label',
              'Select categories',
            )}
          </Button>
        </Group>
      )}

      {filteredData.length === 0 && (
        <Text c="dimmed" size="sm">
          {t(
            'components.categoryPicker.modal.searchBox.emptyResults',
            'No categories found',
          )}
        </Text>
      )}

      <Tree
        style={{ flexGrow: 1 }}
        tree={tree}
        data={filteredData}
        levelOffset={23}
        expandOnClick={mode === 'multiple'}
        renderNode={
          mode === 'multiple'
            ? CategoryTreeNode
            : ({ node, expanded, hasChildren, elementProps }) => (
                <Group gap="xs" {...elementProps}>
                  <Group
                    gap={5}
                    onClick={() => {
                      tree.toggleExpanded(node.value);

                      const selected = categories.find(
                        (cat) => cat.id === node.value,
                      );
                      if (selected) {
                        if (!hasChildren || expanded) {
                          (
                            props as Extract<
                              CategoryPickerModalProps,
                              { mode: 'single' }
                            >
                          ).onSelectionChanged(selected);
                          close();
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
                          transform: expanded
                            ? 'rotate(180deg)'
                            : 'rotate(0deg)',
                        }}
                      />
                    )}
                  </Group>
                </Group>
              )
        }
      />
    </Stack>
  );
}
