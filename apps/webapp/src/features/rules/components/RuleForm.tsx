import { IconGripVertical, IconPlus, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { CategoryDto, FieldDefinitionDto } from '@guallet/api-client';
import { CategoryPicker } from '@/features/categories/components/CategoryPicker/CategoryPicker';
import { useCategory } from '@guallet/api-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface RuleFormData {
  name: string;
  description: string;
  resultCategoryId: string;
  isActive: boolean;
  conditionLogic: 'and' | 'or';
  conditions: ConditionFormData[];
}

export interface ConditionFormData {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface RuleFormProps {
  initialData?: RuleFormData;
  fieldDefinitions: FieldDefinitionDto[];
  onSubmit: (data: RuleFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

let conditionIdCounter = 0;
const generateConditionId = () => `temp-${++conditionIdCounter}`;

const selectClassName =
  'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';
const textAreaClassName =
  'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

export function RuleForm({
  initialData,
  fieldDefinitions,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Save',
}: Readonly<RuleFormProps>) {
  const { t } = useTranslation();
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(
    initialData?.description ?? '',
  );
  const [resultCategoryId, setResultCategoryId] = useState(
    initialData?.resultCategoryId ?? '',
  );

  const { category } = useCategory(resultCategoryId);

  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [conditionLogic, setConditionLogic] = useState<'and' | 'or'>(
    initialData?.conditionLogic ?? 'and',
  );
  const [conditions, setConditions] = useState<ConditionFormData[]>(
    initialData?.conditions ?? [
      { id: generateConditionId(), field: '', operator: '', value: '' },
    ],
  );

  const [draggedCondition, setDraggedCondition] =
    useState<ConditionFormData | null>(null);

  const handleAddCondition = () => {
    setConditions((prev) => [
      ...prev,
      { id: generateConditionId(), field: '', operator: '', value: '' },
    ]);
  };

  const handleRemoveCondition = (id: string) => {
    if (conditions.length > 1) {
      setConditions((prev) => prev.filter((condition) => condition.id !== id));
    }
  };

  const handleConditionChange = (
    id: string,
    field: keyof ConditionFormData,
    value: string,
  ) => {
    setConditions((prev) =>
      prev.map((condition) => {
        if (condition.id !== id) {
          return condition;
        }

        const updated = { ...condition, [field]: value };
        if (field === 'field') {
          updated.operator = '';
        }
        return updated;
      }),
    );
  };

  const getOperatorsForField = (fieldName: string) => {
    const fieldDef = fieldDefinitions.find((field) => field.name === fieldName);
    return fieldDef?.operators ?? [];
  };

  const handleDragStart = (
    event: React.DragEvent,
    condition: ConditionFormData,
  ) => {
    setDraggedCondition(condition);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (
    event: React.DragEvent,
    targetCondition: ConditionFormData,
  ) => {
    event.preventDefault();
    if (!draggedCondition || draggedCondition.id === targetCondition.id) {
      setDraggedCondition(null);
      return;
    }

    const newConditions = [...conditions];
    const draggedIndex = newConditions.findIndex(
      (condition) => condition.id === draggedCondition.id,
    );
    const targetIndex = newConditions.findIndex(
      (condition) => condition.id === targetCondition.id,
    );

    newConditions.splice(draggedIndex, 1);
    newConditions.splice(targetIndex, 0, draggedCondition);

    setConditions(newConditions);
    setDraggedCondition(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({
      name,
      description,
      resultCategoryId,
      isActive,
      conditionLogic,
      conditions,
    });
  };

  const isFormValid =
    name.trim() !== '' &&
    resultCategoryId !== '' &&
    conditions.every(
      (condition) =>
        condition.field !== '' &&
        condition.operator !== '' &&
        condition.value !== '',
    );

  const fieldOptions = fieldDefinitions.map((field) => ({
    value: field.name,
    label: field.label,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="rule-name">
              {t('screens.rules.form.name.label')}
            </Label>
            <Input
              id="rule-name"
              placeholder={t('screens.rules.form.name.placeholder')}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rule-description">
              {t('screens.rules.form.description.label')}
            </Label>
            <textarea
              id="rule-description"
              className={textAreaClassName}
              placeholder={t('screens.rules.form.description.placeholder')}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="rule-is-active"
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.currentTarget.checked)}
              className="h-4 w-4 rounded border border-input"
            />
            <Label htmlFor="rule-is-active" className="cursor-pointer">
              {t('screens.rules.form.isActive.label')}
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">
              {t('screens.rules.form.conditions.title')}
            </p>
            <select
              className={cn(selectClassName, 'h-8 w-[120px] text-xs')}
              value={conditionLogic}
              onChange={(event) =>
                setConditionLogic((event.target.value as 'and' | 'or') ?? 'and')
              }
            >
              <option value="and">
                {t('screens.rules.form.conditions.logic.all')}
              </option>
              <option value="or">
                {t('screens.rules.form.conditions.logic.any')}
              </option>
            </select>
          </div>

          {conditions.map((condition, index) => (
            <div key={condition.id}>
              {index > 0 ? (
                <div className="relative my-2">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                    {conditionLogic.toUpperCase()}
                  </span>
                </div>
              ) : null}

              <Card
                draggable
                onDragStart={(event) => handleDragStart(event, condition)}
                onDragOver={handleDragOver}
                onDrop={(event) => handleDrop(event, condition)}
                className={cn(
                  'border',
                  draggedCondition?.id === condition.id ? 'opacity-50' : '',
                )}
              >
                <CardContent className="pt-4">
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
                    <span
                      aria-hidden="true"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-muted-foreground"
                    >
                      <IconGripVertical size={16} />
                    </span>

                    <div className="min-w-[180px] flex-1 space-y-2">
                      <Label htmlFor={`condition-field-${condition.id}`}>
                        {t('screens.rules.form.conditions.field.label')}
                      </Label>
                      <select
                        id={`condition-field-${condition.id}`}
                        className={selectClassName}
                        value={condition.field}
                        onChange={(event) =>
                          handleConditionChange(
                            condition.id,
                            'field',
                            event.target.value,
                          )
                        }
                      >
                        <option value="">
                          {t('screens.rules.form.conditions.field.placeholder')}
                        </option>
                        {fieldOptions.map((fieldOption) => (
                          <option
                            key={fieldOption.value}
                            value={fieldOption.value}
                          >
                            {fieldOption.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="min-w-[180px] flex-1 space-y-2">
                      <Label htmlFor={`condition-operator-${condition.id}`}>
                        {t('screens.rules.form.conditions.operator.label')}
                      </Label>
                      <select
                        id={`condition-operator-${condition.id}`}
                        className={selectClassName}
                        value={condition.operator}
                        onChange={(event) =>
                          handleConditionChange(
                            condition.id,
                            'operator',
                            event.target.value,
                          )
                        }
                        disabled={!condition.field}
                      >
                        <option value="">
                          {t(
                            'screens.rules.form.conditions.operator.placeholder',
                          )}
                        </option>
                        {getOperatorsForField(condition.field).map(
                          (operator) => (
                            <option key={operator.value} value={operator.value}>
                              {operator.label}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    <div className="min-w-[180px] flex-1 space-y-2">
                      <Label htmlFor={`condition-value-${condition.id}`}>
                        {t('screens.rules.form.conditions.value.label')}
                      </Label>
                      <Input
                        id={`condition-value-${condition.id}`}
                        placeholder={t(
                          'screens.rules.form.conditions.value.placeholder',
                        )}
                        value={condition.value}
                        onChange={(event) =>
                          handleConditionChange(
                            condition.id,
                            'value',
                            event.target.value,
                          )
                        }
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCondition(condition.id)}
                      disabled={conditions.length === 1}
                      className="text-destructive hover:text-destructive"
                      aria-label={t(
                        'screens.rules.form.conditions.removeButton.label',
                        'Remove condition',
                      )}
                    >
                      <IconTrash size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}

          <Button
            type="button"
            variant="secondary"
            onClick={handleAddCondition}
          >
            <IconPlus size={16} />
            {t('screens.rules.form.conditions.addButton.label')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <p className="text-sm font-medium">
            {t('screens.rules.form.category.title')}
          </p>
          <CategoryPicker
            required
            label={t('screens.rules.form.category.label')}
            placeholder={t('screens.rules.form.category.placeholder')}
            selectedCategory={category}
            onCategorySelected={(selectedCategory: CategoryDto) => {
              setResultCategoryId(selectedCategory.id ?? '');
            }}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t('screens.rules.form.buttons.cancel')}
        </Button>
        <Button type="submit" disabled={isSubmitting || !isFormValid}>
          {isSubmitting ? `${submitLabel}...` : submitLabel}
        </Button>
      </div>
    </form>
  );
}
