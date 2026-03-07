import { ResponsiveModal } from '@guallet/ui-react';
import { CategoryDto } from '@guallet/api-client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useDisclosure } from '@/hooks/useDisclosure';
import { cn } from '@/lib/utils';
import { useId, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CategoryPickerModal } from './CategoryPickerModal';
import { CategoryIcon } from '@/components/Categories/CategoryIcon';

interface CategoryPickerProps {
  selectedCategory: CategoryDto | null;
  onCategorySelected: (selectedCategory: CategoryDto) => void;
  placeholder?: string;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export function CategoryPicker({
  selectedCategory,
  onCategorySelected,
  placeholder,
  ...props
}: Readonly<CategoryPickerProps>) {
  const { t } = useTranslation();
  const [opened, { open, close }] = useDisclosure(false);
  const inputId = useId();

  const inputValue = useMemo(() => {
    if (!selectedCategory) {
      // We don't want to return anything, so it falls back to the placeholder
      return undefined;
    }

    return selectedCategory.name;
  }, [selectedCategory]);

  const inputPlaceholder =
    placeholder ||
    t('components.categoryPicker.input.placeholder', 'Select category');

  return (
    <>
      <div className={cn('grid gap-2', props.className)}>
        {props.label ? (
          <Label htmlFor={inputId}>
            {props.label}
            {props.required ? ' *' : ''}
          </Label>
        ) : null}

        <Button
          id={inputId}
          type="button"
          variant="outline"
          className={cn(
            'w-full justify-start gap-2 font-normal',
            !inputValue && 'text-muted-foreground',
            props.error && 'border-destructive',
          )}
          onClick={open}
        >
          {selectedCategory ? (
            <CategoryIcon categoryId={selectedCategory.id} />
          ) : null}
          <span className="truncate">{inputValue ?? inputPlaceholder}</span>
        </Button>

        {props.description ? (
          <p className="text-sm text-muted-foreground">{props.description}</p>
        ) : null}

        {props.error ? (
          <p className="text-sm text-destructive">{props.error}</p>
        ) : null}
      </div>

      <ResponsiveModal
        opened={opened}
        onClose={close}
        title={
          <span>
            {t('components.categoryPicker.modal.title', 'Select Category')}
          </span>
        }
        size="lg"
      >
        <CategoryPickerModal
          selectedCategory={selectedCategory}
          onSelectionChanged={onCategorySelected}
          close={close}
        />
      </ResponsiveModal>
    </>
  );
}
