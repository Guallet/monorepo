import { SearchBoxInput } from '@guallet/ui-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCategories } from '@guallet/api-react';
import { CategoryDto } from '@guallet/api-client';
import {
  IconChevronDown,
  IconChevronsDown,
  IconChevronsUp,
} from '@tabler/icons-react';
import { CategoryIcon } from '@/components/Categories/CategoryIcon';
import { Button } from '@/components/ui/button';

interface CategoryPickerModalProps {
  selectedCategory: CategoryDto | null;
  onSelectionChanged: (selectedCategory: CategoryDto) => void;
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

export function CategoryPickerModal({
  onSelectionChanged,
  close,
}: Readonly<CategoryPickerModalProps>) {
  const { t } = useTranslation();
  const { categories } = useCategories();
  const [filterQuery, setFilterQuery] = useState('');

  const groupedCategories = useMemo(
    () => getCategoryGroups(categories, filterQuery),
    [categories, filterQuery],
  );

  const [expandedRootIds, setExpandedRootIds] = useState<string[]>([]);

  const rootsWithChildren = useMemo(
    () =>
      groupedCategories
        .filter((group) => group.children.length > 0)
        .map((group) => group.root.id),
    [groupedCategories],
  );

  const onCategorySelected = (category: CategoryDto) => {
    onSelectionChanged(category);
    close();
  };

  const toggleRoot = (rootId: string) => {
    setExpandedRootIds((currentIds) =>
      currentIds.includes(rootId)
        ? currentIds.filter((id) => id !== rootId)
        : [...currentIds, rootId],
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
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

        <Button
          type="button"
          variant="outline"
          size="icon"
          title={t('components.categoryPicker.modal.expandAllButton.label', 'Expand all')}
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
            'components.categoryPicker.modal.collapseAllButton.label',
            'Collapse all',
          )}
          onClick={() => {
            setExpandedRootIds([]);
          }}
        >
          <IconChevronsUp />
        </Button>
      </div>

      {groupedCategories.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {t(
            'components.categoryPicker.modal.searchBox.emptyResults',
            'No categories found',
          )}
        </p>
      )}

      <div className="space-y-2">
        {groupedCategories.map((group) => {
          const hasChildren = group.children.length > 0;
          const isExpanded = expandedRootIds.includes(group.root.id);

          return (
            <div key={group.root.id} className="rounded-md border">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-accent"
                onClick={() => {
                  if (!hasChildren) {
                    onCategorySelected(group.root);
                    return;
                  }

                  toggleRoot(group.root.id);

                  if (isExpanded) {
                    onCategorySelected(group.root);
                  }
                }}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <CategoryIcon categoryId={group.root.id} />
                  <span className="truncate">{group.root.name}</span>
                </span>

                {hasChildren ? (
                  <IconChevronDown
                    className={isExpanded ? 'rotate-180 transition-transform' : 'transition-transform'}
                    size={14}
                  />
                ) : null}
              </button>

              {hasChildren && isExpanded ? (
                <div className="space-y-1 border-t px-3 py-2">
                  {group.children.map((child) => (
                    <button
                      key={child.id}
                      type="button"
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-1 text-left hover:bg-accent"
                      onClick={() => {
                        onCategorySelected(child);
                      }}
                    >
                      <CategoryIcon categoryId={child.id} />
                      <span className="truncate">{child.name}</span>
                    </button>
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