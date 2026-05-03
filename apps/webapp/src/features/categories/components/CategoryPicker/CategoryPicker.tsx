import { ResponsiveModal } from '@guallet/ui-react';
import { CategoryDto } from '@guallet/api-client';
import { Input, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCategories } from '@guallet/api-react';
import { CategoryPickerModal } from './CategoryPickerModal';
import { CategoryIcon } from '@/components/Categories/CategoryIcon';

type CategoryPickerProps = React.ComponentProps<typeof Input.Wrapper> &
  (
    | {
        mode: 'single';
        selectedCategory: CategoryDto | null;
        onSelectionChanged: (category: CategoryDto) => void;
        placeholder?: string;
      }
    | {
        mode: 'multiple';
        selectedCategories: CategoryDto[];
        onSelectionChanged: (categories: CategoryDto[]) => void;
      }
  );

export function CategoryPicker(props: Readonly<CategoryPickerProps>) {
  const { t } = useTranslation();
  const [opened, { open, close }] = useDisclosure(false);
  const { categories } = useCategories();

  const inputValue = useMemo(() => {
    if (props.mode === 'single') {
      return props.selectedCategory?.name ?? undefined;
    }
    if (props.selectedCategories.length === 0) return '';
    if (props.selectedCategories.length === categories.length) {
      return t(
        'components.categoryPicker.input.valueAll',
        'All categories selected',
      );
    }
    return t('components.categoryPicker.input.value', {
      count: props.selectedCategories.length,
    });
  }, [props, categories.length, t]);

  const inputPlaceholder =
    props.mode === 'single'
      ? (props.placeholder ??
        t(
          'components.categoryPicker.input.placeholderSingle',
          'Select category',
        ))
      : t(
          'components.categoryPicker.input.placeholderMultiple',
          'Select categories',
        );

  const modalTitle =
    props.mode === 'single'
      ? t('components.categoryPicker.modal.title', 'Select Category')
      : t('components.categoryPicker.modal.titleMultiple', 'Select Categories');

  // Separate mode-specific props from Input.Wrapper props
  const { mode, onSelectionChanged, ...rest } = props as CategoryPickerProps & {
    selectedCategory?: CategoryDto | null;
    selectedCategories?: CategoryDto[];
    placeholder?: string;
  };
  const {
    selectedCategory = null,
    selectedCategories = [],
    placeholder: _placeholder,
    ...wrapperProps
  } = rest;

  return (
    <>
      <Input.Wrapper {...wrapperProps}>
        <Input
          readOnly
          value={inputValue}
          onClick={open}
          placeholder={inputPlaceholder}
          pointer={true}
          leftSection={
            mode === 'single' && selectedCategory ? (
              <CategoryIcon categoryId={selectedCategory.id} />
            ) : null
          }
        />
      </Input.Wrapper>
      <ResponsiveModal
        opened={opened}
        onClose={close}
        title={<Text>{modalTitle}</Text>}
        size="lg"
      >
        {mode === 'single' ? (
          <CategoryPickerModal
            mode="single"
            selectedCategory={selectedCategory}
            onSelectionChanged={
              onSelectionChanged as (category: CategoryDto) => void
            }
            close={close}
          />
        ) : (
          <CategoryPickerModal
            mode="multiple"
            selectedCategories={selectedCategories}
            onSelectionChanged={
              onSelectionChanged as (categories: CategoryDto[]) => void
            }
            close={close}
          />
        )}
      </ResponsiveModal>
    </>
  );
}
