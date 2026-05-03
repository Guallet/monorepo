import {
  ActionIcon,
  Box,
  Button,
  Card,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  Divider,
  ThemeIcon,
} from '@mantine/core';
import {
  IconArrowRight,
  IconGripVertical,
  IconListDetails,
  IconPlus,
  IconSettingsAutomation,
  IconTag,
  IconTrash,
} from '@tabler/icons-react';
import { useState } from 'react';
import { CategoryDto, FieldDefinitionDto } from '@guallet/api-client';
import { CategoryPicker } from '@/features/categories/components/CategoryPicker/CategoryPicker';
import { useCategory } from '@guallet/api-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@guallet/ui-react';

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

export function RuleForm({
  initialData,
  fieldDefinitions,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Save',
}: Readonly<RuleFormProps>) {
  const { t } = useTranslation();
  const { borderRadius, colors, spacing } = useTheme();
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
    setConditions([
      ...conditions,
      { id: generateConditionId(), field: '', operator: '', value: '' },
    ]);
  };

  const handleRemoveCondition = (id: string) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter((c) => c.id !== id));
    }
  };

  const handleConditionChange = (
    id: string,
    field: keyof ConditionFormData,
    value: string,
  ) => {
    setConditions(
      conditions.map((c) => {
        if (c.id === id) {
          const updated = { ...c, [field]: value };
          // Reset operator when field changes
          if (field === 'field') {
            updated.operator = '';
          }
          return updated;
        }
        return c;
      }),
    );
  };

  const getOperatorsForField = (fieldName: string) => {
    const fieldDef = fieldDefinitions.find((f) => f.name === fieldName);
    return fieldDef?.operators ?? [];
  };

  const handleDragStart = (
    e: React.DragEvent,
    condition: ConditionFormData,
  ) => {
    setDraggedCondition(condition);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (
    e: React.DragEvent,
    targetCondition: ConditionFormData,
  ) => {
    e.preventDefault();
    if (!draggedCondition || draggedCondition.id === targetCondition.id) {
      setDraggedCondition(null);
      return;
    }

    const newConditions = [...conditions];
    const draggedIndex = newConditions.findIndex(
      (c) => c.id === draggedCondition.id,
    );
    const targetIndex = newConditions.findIndex(
      (c) => c.id === targetCondition.id,
    );

    newConditions.splice(draggedIndex, 1);
    newConditions.splice(targetIndex, 0, draggedCondition);

    setConditions(newConditions);
    setDraggedCondition(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      (c) => c.field !== '' && c.operator !== '' && c.value !== '',
    );

  const fieldOptions = fieldDefinitions.map((f) => ({
    value: f.name,
    label: f.label,
  }));

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap={spacing.md}>
        <Card withBorder shadow="sm" radius="lg" p={spacing.lg}>
          <Stack gap={spacing.md}>
            <Group gap={spacing.md} align="flex-start" wrap="nowrap">
              <ThemeIcon size={40} radius="md" variant="light" color="blue">
                <IconListDetails size={22} strokeWidth={1.5} />
              </ThemeIcon>
              <Box>
                <Text fw={600}>
                  {t('screens.rules.form.details.title', 'Rule details')}
                </Text>
                <Text size="sm" c="dimmed" mt={spacing.xs}>
                  {t(
                    'screens.rules.form.details.description',
                    'Name the rule and choose whether it should run now.',
                  )}
                </Text>
              </Box>
            </Group>

            <TextInput
              label={t('screens.rules.form.name.label', 'Rule name')}
              placeholder={t(
                'screens.rules.form.name.placeholder',
                'e.g. Grocery stores',
              )}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Textarea
              label={t('screens.rules.form.description.label', 'Description')}
              placeholder={t(
                'screens.rules.form.description.placeholder',
                'Optional description of what this rule does',
              )}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />

            <Switch
              label={t('screens.rules.form.isActive.label', 'Rule is active')}
              checked={isActive}
              onChange={(e) => setIsActive(e.currentTarget.checked)}
            />
          </Stack>
        </Card>

        <Card withBorder shadow="sm" radius="lg" p={spacing.lg}>
          <Stack gap={spacing.md}>
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Group gap={spacing.md} align="flex-start" wrap="nowrap">
                <ThemeIcon size={40} radius="md" variant="light" color="blue">
                  <IconSettingsAutomation size={22} strokeWidth={1.5} />
                </ThemeIcon>
                <Box>
                  <Text fw={600}>
                    {t('screens.rules.form.conditions.title', 'Conditions')}
                  </Text>
                  <Text size="sm" c="dimmed" mt={spacing.xs}>
                    {t(
                      'screens.rules.form.conditions.description',
                      'Choose what a transaction must match before the category is assigned.',
                    )}
                  </Text>
                </Box>
              </Group>
              <Select
                size="xs"
                w={120}
                value={conditionLogic}
                onChange={(value) =>
                  setConditionLogic((value as 'and' | 'or') ?? 'and')
                }
                data={[
                  {
                    value: 'and',
                    label: t(
                      'screens.rules.form.conditions.logic.all',
                      'Match all',
                    ),
                  },
                  {
                    value: 'or',
                    label: t(
                      'screens.rules.form.conditions.logic.any',
                      'Match any',
                    ),
                  },
                ]}
              />
            </Group>

            {conditions.map((condition, index) => (
              <Box key={condition.id}>
                {index > 0 && (
                  <Divider
                    label={
                      conditionLogic === 'and'
                        ? t('screens.rules.form.conditions.logic.allDivider', 'And')
                        : t('screens.rules.form.conditions.logic.anyDivider', 'Or')
                    }
                    labelPosition="center"
                    my={spacing.xs}
                  />
                )}
                <Box
                  draggable
                  onDragStart={(e) => handleDragStart(e, condition)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, condition)}
                  style={{
                    cursor: 'grab',
                    border: `1px solid ${colors.paleGrey}`,
                    borderRadius: borderRadius.lg,
                    padding: spacing.md,
                    backgroundColor: colors.white,
                    opacity: draggedCondition?.id === condition.id ? 0.5 : 1,
                  }}
                >
                  <Stack gap={spacing.sm}>
                    <Group gap="xs" justify="space-between">
                      <Group gap={spacing.xs}>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          aria-label={t(
                            'screens.rules.form.conditions.dragHandle',
                            'Drag condition',
                          )}
                          style={{ cursor: 'grab' }}
                        >
                          <IconGripVertical size={20} strokeWidth={1.5} />
                        </ActionIcon>
                        <Text size="sm" fw={600}>
                          {t(
                            'screens.rules.form.conditions.itemTitle',
                            'Condition {{index}}',
                            { index: index + 1 },
                          )}
                        </Text>
                      </Group>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => handleRemoveCondition(condition.id)}
                        disabled={conditions.length === 1}
                        aria-label={t(
                          'screens.rules.form.conditions.removeButton.label',
                          'Remove condition',
                        )}
                      >
                        <IconTrash size={20} strokeWidth={1.5} />
                      </ActionIcon>
                    </Group>
                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={spacing.sm}>
                      <Select
                        label={t(
                          'screens.rules.form.conditions.field.label',
                          'Field',
                        )}
                        placeholder={t(
                          'screens.rules.form.conditions.field.placeholder',
                          'Select field',
                        )}
                        data={fieldOptions}
                        value={condition.field}
                        onChange={(value) =>
                          handleConditionChange(
                            condition.id,
                            'field',
                            value ?? '',
                          )
                        }
                      />
                      <Select
                        label={t(
                          'screens.rules.form.conditions.operator.label',
                          'Operator',
                        )}
                        placeholder={t(
                          'screens.rules.form.conditions.operator.placeholder',
                          'Select operator',
                        )}
                        data={getOperatorsForField(condition.field)}
                        value={condition.operator}
                        onChange={(value) =>
                          handleConditionChange(
                            condition.id,
                            'operator',
                            value ?? '',
                          )
                        }
                        disabled={!condition.field}
                      />
                      <TextInput
                        label={t(
                          'screens.rules.form.conditions.value.label',
                          'Value',
                        )}
                        placeholder={t(
                          'screens.rules.form.conditions.value.placeholder',
                          'Enter value',
                        )}
                        value={condition.value}
                        onChange={(e) =>
                          handleConditionChange(
                            condition.id,
                            'value',
                            e.target.value,
                          )
                        }
                      />
                    </SimpleGrid>
                  </Stack>
                </Box>
              </Box>
            ))}

            <Button
              variant="light"
              leftSection={<IconPlus size={16} strokeWidth={1.5} />}
              onClick={handleAddCondition}
            >
              {t(
                'screens.rules.form.conditions.addButton.label',
                'Add condition',
              )}
            </Button>
          </Stack>
        </Card>

        <Card withBorder shadow="sm" radius="lg" p={spacing.lg}>
          <Stack gap={spacing.md}>
            <Group gap={spacing.md} align="flex-start" wrap="nowrap">
              <ThemeIcon size={40} radius="md" variant="light" color="blue">
                <IconTag size={22} strokeWidth={1.5} />
              </ThemeIcon>
              <Box>
                <Text fw={600}>
                  {t('screens.rules.form.category.title', 'Then assign category')}
                </Text>
                <Text size="sm" c="dimmed" mt={spacing.xs}>
                  {t(
                    'screens.rules.form.category.description',
                    'Matching transactions will be moved into this category.',
                  )}
                </Text>
              </Box>
            </Group>
            <CategoryPicker
              mode="single"
              required
              label={t('screens.rules.form.category.label', 'Category')}
              placeholder={t(
                'screens.rules.form.category.placeholder',
                'Select category to assign',
              )}
              selectedCategory={category}
              onSelectionChanged={(selectedCategory: CategoryDto) => {
                setResultCategoryId(selectedCategory.id ?? '');
              }}
            />
          </Stack>
        </Card>

        <Stack gap={spacing.xs} hiddenFrom="sm">
          <Button
            type="submit"
            fullWidth
            size="md"
            loading={isSubmitting}
            disabled={!isFormValid}
          >
            {submitLabel}
          </Button>
          <Button
            variant="outline"
            fullWidth
            size="md"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t('screens.rules.form.buttons.cancel', 'Cancel')}
          </Button>
        </Stack>
        <Group justify="space-between" gap={spacing.xs} visibleFrom="sm">
          <Group gap={spacing.xs} style={{ color: colors.midGrey }}>
            <IconArrowRight size={16} strokeWidth={1.5} />
            <Text size="sm">
              {t(
                'screens.rules.form.footerHint',
                'Rules apply to new matching transactions.',
              )}
            </Text>
          </Group>
          <Group gap={spacing.xs}>
            <Button variant="subtle" onClick={onCancel} disabled={isSubmitting}>
              {t('screens.rules.form.buttons.cancel', 'Cancel')}
            </Button>
            <Button type="submit" loading={isSubmitting} disabled={!isFormValid}>
              {submitLabel}
            </Button>
          </Group>
        </Group>
      </Stack>
    </form>
  );
}
