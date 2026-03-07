import { SearchBoxInput } from '@guallet/ui-react';
import { useCategories } from '@guallet/api-react';
import { CategoryDto } from '@guallet/api-client';
import {
  IconChevronDown,
  IconChevronsDown,
  IconChevronsUp,
  IconDeselect,
  IconSelectAll,
} from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CategoryIcon } from '@/components/Categories/CategoryIcon';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface CategoryMultiSelectModalProps {
  selectedCategories: CategoryDto[];
  onSelectionChanged: (selectedCategories: CategoryDto[]) => void;
  close: () => void;
}

type CategoryGroup = {
  root: CategoryDto;
  children: CategoryDto[];
};

function getCategoryGroups(
  categories: CategoryDto[],
  filterQuery: string,
): CategoryGroup[] {
  const normalizedQuery = filterQuery.trim().toLowerCase();

  if (!normalizedQuery) {
    const roots = categories.filter((category) => !category.parentId);
    return roots.map((root) => ({
      root,
      children: categories.filter((category) => category.parentId === root.id),
    }));
  }

  const visibleCategoryIds = new Set<string>();

  for (const category of categories) {
    const isMatch = category.name.toLowerCase().includes(normalizedQuery);
    if (!isMatch) {
      continue;
    }

    visibleCategoryIds.add(category.id);
    if (category.parentId) {
      visibleCategoryIds.add(category.parentId);
    }
  }

  const filteredCategories = categories.filter((category) =>
    visibleCategoryIds.has(category.id),
  );
  const roots = filteredCategories.filter((category) => !category.parentId);

  return roots.map((root) => ({
    root,
    children: filteredCategories.filter((category) => category.parentId === root.id),
  }));
}

function getGroupCheckState(
  selectedCount: number,
  totalCount: number,
): boolean | 'indeterminate' {
  if (selectedCount === 0) {
    return false;
  }

  if (selectedCount === totalCount) {
    return true;
  }

  return 'indeterminate';
}

export function CategoryMultiSelectModal({
  selectedCategories,
  onSelectionChanged,
  close,
}: Readonly<CategoryMultiSelectModalProps>) {
  const { t } = useTranslation();
  const { categories } = useCategories();
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(() =>
    selectedCategories.map((category) => category.id),
  );

  const groupedCategories = useMemo(
    () => getCategoryGroups(categories, filterQuery),
    [categories, filterQuery],
  );

  const rootsWithChildren = useMemo(
    () =>
      groupedCategories
        .filter((group) => group.children.length > 0)
        .map((group) => group.root.id),
    [groupedCategories],
  );

  const [expandedRootIds, setExpandedRootIds] = useState<string[]>(
    rootsWithChildren,
  );

  const visibleExpandedRootIds = useMemo(() => {
    const allowedIds = new Set(rootsWithChildren);
    return expandedRootIds.filter((id) => allowedIds.has(id));
  }, [expandedRootIds, rootsWithChildren]);

  const selectedCategoryIdSet = useMemo(
    () => new Set(selectedCategoryIds),
    [selectedCategoryIds],
  );

  const toggleRootExpansion = (rootId: string) => {
    setExpandedRootIds((currentIds) =>
      currentIds.includes(rootId)
        ? currentIds.filter((id) => id !== rootId)
        : [...currentIds, rootId],
    );
  };

  const onSubmitSelectedCategories = () => {
    const selected = categories.filter((category) =>
      selectedCategoryIdSet.has(category.id),
    );
    onSelectionChanged(selected);
    close();
  };

  const setSingleCategorySelection = (categoryId: string, checked: boolean) => {
    setSelectedCategoryIds((currentIds) => {
      const currentSet = new Set(currentIds);

      if (checked) {
        currentSet.add(categoryId);
      } else {
        currentSet.delete(categoryId);
      }

      return [...currentSet];
    });
  };

  const setGroupSelection = (
    rootId: string,
    childIds: string[],
    checked: boolean,
  ) => {
    setSelectedCategoryIds((currentIds) => {
      const currentSet = new Set(currentIds);
      const groupIds = [rootId, ...childIds];

      for (const id of groupIds) {
        if (checked) {
          currentSet.add(id);
        } else {
          currentSet.delete(id);
        }
      }

      return [...currentSet];
    });
  };

  const selectAllVisibleCategories = () => {
    const visibleIds = groupedCategories.flatMap((group) => [
      group.root.id,
      ...group.children.map((child) => child.id),
    ]);

    setSelectedCategoryIds((currentIds) => {
      const mergedIds = new Set(currentIds);
      for (const id of visibleIds) {
        mergedIds.add(id);
      }
      return [...mergedIds];
    });
  };

  const unselectAllVisibleCategories = () => {
    const visibleIdSet = new Set(
      groupedCategories.flatMap((group) => [
        group.root.id,
        ...group.children.map((child) => child.id),
      ]),
    );

    setSelectedCategoryIds((currentIds) =>
      currentIds.filter((id) => !visibleIdSet.has(id)),
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SearchBoxInput
          style={{ flexGrow: 1 }}
          placeholder={t(
            'components.categoryMultiSelect.modal.searchBox.placeholder',
            'Search categories',
          )}
          query={filterQuery}
          debounceWait={350}
          onSearchQueryChanged={(value) => setFilterQuery(value)}
        />

        <Button
          type="button"
          variant="outline"
          size="icon"
          title={t('components.categoryMultiSelect.modal.checkAllButton.label', 'Check all')}
          onClick={selectAllVisibleCategories}
        >
          <IconSelectAll />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          title={t(
            'components.categoryMultiSelect.modal.uncheckAllButton.label',
            'Uncheck all',
          )}
          onClick={unselectAllVisibleCategories}
        >
          <IconDeselect />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          title={t('components.categoryMultiSelect.modal.expandAllButton.label', 'Expand all')}
          onClick={() => {
            setExpandedRootIds(rootsWithChildren);
          }}
        >
          <IconChevronsDown />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          title={t(
            'components.categoryMultiSelect.modal.collapseAllButton.label',
            'Collapse all',
          )}
          onClick={() => {
            setExpandedRootIds([]);
          }}
        >
          <IconChevronsUp />
        </Button>
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={onSubmitSelectedCategories}>
          {t(
            'components.categoryMultiSelect.modal.selectButton.label',
            'Select categories',
          )}
        </Button>
      </div>

      {groupedCategories.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {t(
            'components.categoryMultiSelect.modal.searchBox.emptyResults',
            'No categories found',
          )}
        </p>
      )}

      <div className="space-y-2">
        {groupedCategories.map((group) => {
          const childIds = group.children.map((child) => child.id);
          const groupIds = [group.root.id, ...childIds];
          const selectedCount = groupIds.filter((id) =>
            selectedCategoryIdSet.has(id),
          ).length;
          const rootCheckState = getGroupCheckState(
            selectedCount,
            groupIds.length,
          );
          const hasChildren = group.children.length > 0;
          const isExpanded = visibleExpandedRootIds.includes(group.root.id);

          return (
            <div key={group.root.id} className="rounded-md border">
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <label className="flex min-w-0 flex-1 items-center gap-2">
                  <Checkbox
                    checked={rootCheckState}
                    onCheckedChange={(checked) => {
                      setGroupSelection(group.root.id, childIds, checked === true);
                    }}
                  />
                  <CategoryIcon categoryId={group.root.id} />
                  <span className="truncate">{group.root.name}</span>
                </label>

                {hasChildren ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      toggleRootExpansion(group.root.id);
                    }}
                  >
                    <IconChevronDown
                      className={isExpanded ? 'rotate-180 transition-transform' : 'transition-transform'}
                      size={14}
                    />
                  </Button>
                ) : null}
              </div>

              {hasChildren && isExpanded ? (
                <div className="space-y-1 border-t px-3 py-2 pl-8">
                  {group.children.map((child) => (
                    <label key={child.id} className="flex items-center gap-2 rounded-sm px-2 py-1 hover:bg-accent">
                      <Checkbox
                        checked={selectedCategoryIdSet.has(child.id)}
                        onCheckedChange={(checked) => {
                          setSingleCategorySelection(child.id, checked === true);
                        }}
                      />
                      <CategoryIcon categoryId={child.id} />
                      <span className="truncate">{child.name}</span>
                    </label>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}