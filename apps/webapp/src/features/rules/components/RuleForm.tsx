import {
  ActionIcon,
  Button,
  Card,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Switch,
  Divider,
} from '@mantine/core';
import { IconPlus, IconTrash, IconGripVertical } from '@tabler/icons-react';
import { useState } from 'react';
import { CategoryDto, FieldDefinition } from '@guallet/api-client';
import { Category } from '@/features/categories/models/Category';
import { CategoryPicker } from '@/features/categories/components/CategoryPicker/CategoryPicker';
import { useCategory } from '@guallet/api-react';

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
  fieldDefinitions: FieldDefinition[];
  categories: Category[];
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
  categories,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Save',
}: Readonly<RuleFormProps>) {
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

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const fieldOptions = fieldDefinitions.map((f) => ({
    value: f.name,
    label: f.label,
  }));

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <Card withBorder p="md">
          <Stack gap="md">
            <TextInput
              label="Rule Name"
              placeholder="e.g., Grocery stores"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Textarea
              label="Description"
              placeholder="Optional description of what this rule does"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />

            <Switch
              label="Rule is active"
              checked={isActive}
              onChange={(e) => setIsActive(e.currentTarget.checked)}
            />
          </Stack>
        </Card>

        <Card withBorder p="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={500}>Conditions</Text>
              <Select
                size="xs"
                w={120}
                value={conditionLogic}
                onChange={(value) =>
                  setConditionLogic((value as 'and' | 'or') ?? 'and')
                }
                data={[
                  { value: 'and', label: 'Match ALL' },
                  { value: 'or', label: 'Match ANY' },
                ]}
              />
            </Group>

            {conditions.map((condition, index) => (
              <div key={condition.id}>
                {index > 0 && (
                  <Divider
                    label={conditionLogic.toUpperCase()}
                    labelPosition="center"
                    my="xs"
                  />
                )}
                <Card
                  withBorder
                  p="sm"
                  draggable
                  onDragStart={(e) => handleDragStart(e, condition)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, condition)}
                  style={{
                    cursor: 'grab',
                    opacity: draggedCondition?.id === condition.id ? 0.5 : 1,
                  }}
                >
                  <Group gap="xs" wrap="nowrap" align="flex-end">
                    <ActionIcon
                      variant="subtle"
                      style={{ cursor: 'grab' }}
                      mb={4}
                    >
                      <IconGripVertical size={16} />
                    </ActionIcon>
                    <Select
                      label="Field"
                      placeholder="Select field"
                      data={fieldOptions}
                      value={condition.field}
                      onChange={(value) =>
                        handleConditionChange(
                          condition.id,
                          'field',
                          value ?? '',
                        )
                      }
                      style={{ flex: 1 }}
                    />
                    <Select
                      label="Operator"
                      placeholder="Select operator"
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
                      style={{ flex: 1 }}
                    />
                    <TextInput
                      label="Value"
                      placeholder="Enter value"
                      value={condition.value}
                      onChange={(e) =>
                        handleConditionChange(
                          condition.id,
                          'value',
                          e.target.value,
                        )
                      }
                      style={{ flex: 1 }}
                    />
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => handleRemoveCondition(condition.id)}
                      disabled={conditions.length === 1}
                      mb={4}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Card>
              </div>
            ))}

            <Button
              variant="light"
              leftSection={<IconPlus size={16} />}
              onClick={handleAddCondition}
            >
              Add Condition
            </Button>
          </Stack>
        </Card>

        <Card withBorder p="md">
          <Stack gap="md">
            <Text fw={500}>Then assign category</Text>
            {/* <Select
              label="Category"
              placeholder="Select category to assign"
              data={categoryOptions}
              value={resultCategoryId}
              onChange={(value) => setResultCategoryId(value ?? '')}
              searchable
              required
            /> */}
            <CategoryPicker
              required
              label="Category"
              placeholder="Select category to assign"
              selectedCategory={category}
              onCategorySelected={(selectedCategory: CategoryDto) => {
                setResultCategoryId(selectedCategory.id ?? '');
              }}
            />
          </Stack>
        </Card>

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting} disabled={!isFormValid}>
            {submitLabel}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
