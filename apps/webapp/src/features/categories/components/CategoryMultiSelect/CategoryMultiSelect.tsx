import { CategoryDto } from '@guallet/api-client';
import { ResponsiveModal } from '@guallet/ui-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useDisclosure } from '@/hooks/useDisclosure';
import { cn } from '@/lib/utils';
import { useId, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CategoryMultiSelectModal } from './CategoryMultiSelectModal';
import { useCategories } from '@guallet/api-react';

interface CategoryMultiSelectProps {
  selectedCategories: CategoryDto[];
  onSelectionChanged: (selectedCategories: CategoryDto[]) => void;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export function CategoryMultiSelect({
  selectedCategories,
  onSelectionChanged,
  ...props
}: Readonly<CategoryMultiSelectProps>) {
  const { t } = useTranslation();
  const inputId = useId();

  const [opened, { open, close }] = useDisclosure(false);
  const { categories } = useCategories();

  const inputValue = useMemo(() => {
    if (selectedCategories.length === 0) {
      // We don't want to return anything, so it falls back to the placeholder
      return '';
    }

    if (selectedCategories.length === categories.length) {
      return t(
        'components.categoryMultiSelect.input.valueAll',
        'All categories selected',
      );
    } else {
      const label = t('components.categoryMultiSelect.input.value', {
        count: selectedCategories.length,
      });
      return label;
    }
  }, [selectedCategories, categories.length, t]);

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
            'w-full justify-start font-normal',
            !inputValue && 'text-muted-foreground',
            props.error && 'border-destructive',
          )}
          onClick={open}
        >
          <span className="truncate">
            {inputValue ||
              t(
                'components.categoryMultiSelect.input.placeholder',
                'Select categories',
              )}
          </span>
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
            {t(
              'components.categoryMultiSelect.modal.title',
              'Select Categories',
            )}
          </span>
        }
        size="lg"
      >
        <CategoryMultiSelectModal
          selectedCategories={selectedCategories}
          onSelectionChanged={onSelectionChanged}
          close={close}
        />
      </ResponsiveModal>
    </>
  );
}
