import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Text,
  Title,
  Switch,
  Menu,
} from '@mantine/core';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconGripVertical,
  IconDotsVertical,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { RuleDto } from '@guallet/api-client';
import { Category } from '@/features/categories/models/Category';
import { useCategories, useRuleMutations, useRules } from '@guallet/api-react';

export const Route = createFileRoute('/_app/categories/rules/')({
  component: RulesPage,
});

function RulesPage() {
  const { rules } = useRules();
  const { categories } = useCategories();

  const { reorderRulesMutation, deleteRuleMutation, updateRuleMutation } =
    useRuleMutations();

  const navigate = useNavigate();
  const [draggedItem, setDraggedItem] = useState<RuleDto | null>(null);

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((c: Category) => c.id === categoryId);
    return category?.name ?? 'Unknown Category';
  };

  const handleDragStart = (e: React.DragEvent, rule: RuleDto) => {
    setDraggedItem(rule);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetRule: RuleDto) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetRule.id) {
      setDraggedItem(null);
      return;
    }

    const newRules = [...rules];
    const draggedIndex = newRules.findIndex((r) => r.id === draggedItem.id);
    const targetIndex = newRules.findIndex((r) => r.id === targetRule.id);

    newRules.splice(draggedIndex, 1);
    newRules.splice(targetIndex, 0, draggedItem);

    setDraggedItem(null);

    try {
      const ruleIds = newRules.map((r) => r.id);

      await reorderRulesMutation.mutateAsync({
        ruleIds: ruleIds,
      });

      notifications.show({
        title: 'Success',
        message: 'Rules reordered successfully',
        color: 'green',
      });
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to reorder rules',
        color: 'red',
      });
    }
  };

  const handleDelete = async (ruleId: string) => {
    try {
      await deleteRuleMutation.mutateAsync({ id: ruleId });

      notifications.show({
        title: 'Success',
        message: 'Rule deleted successfully',
        color: 'green',
      });
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete rule',
        color: 'red',
      });
    }
  };

  const handleToggleActive = async (rule: RuleDto) => {
    try {
      await updateRuleMutation.mutateAsync({
        id: rule.id,
        request: { isActive: !rule.isActive },
      });
      notifications.show({
        title: 'Success',
        message: `Rule ${rule.isActive ? 'disabled' : 'enabled'} successfully`,
        color: 'green',
      });
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to update rule',
        color: 'red',
      });
    }
  };

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Title order={2}>Categorization Rules</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => navigate({ to: '/categories/rules/new' })}
        >
          Create Rule
        </Button>
      </Group>

      <Text c="dimmed" size="sm">
        Rules are evaluated in order from top to bottom. Drag and drop to
        reorder. The first matching rule will be applied to categorize
        transactions.
      </Text>

      {rules.length === 0 ? (
        <Card withBorder p="xl" ta="center">
          <Text c="dimmed">No rules created yet.</Text>
          <Button
            mt="md"
            variant="light"
            leftSection={<IconPlus size={16} />}
            onClick={() => navigate({ to: '/categories/rules/new' })}
          >
            Create your first rule
          </Button>
        </Card>
      ) : (
        <Stack gap="xs">
          {rules.map((rule, index) => (
            <Card
              key={rule.id}
              withBorder
              shadow="sm"
              p="sm"
              draggable
              onDragStart={(e) => handleDragStart(e, rule)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, rule)}
              style={{
                cursor: 'grab',
                opacity: draggedItem?.id === rule.id ? 0.5 : 1,
              }}
            >
              <Group justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap" style={{ flex: 1 }}>
                  <ActionIcon variant="subtle" style={{ cursor: 'grab' }}>
                    <IconGripVertical size={16} />
                  </ActionIcon>
                  <Badge size="sm" variant="light" color="gray">
                    #{index + 1}
                  </Badge>
                  <Stack gap={2} style={{ flex: 1 }}>
                    <Group gap="xs">
                      <Text fw={500}>{rule.name}</Text>
                      {!rule.isActive && (
                        <Badge size="xs" color="gray">
                          Disabled
                        </Badge>
                      )}
                    </Group>
                    {rule.description && (
                      <Text size="sm" c="dimmed" lineClamp={1}>
                        {rule.description}
                      </Text>
                    )}
                    <Group gap="xs">
                      <Text size="xs" c="dimmed">
                        {/* // TODO: This should be pluralized properly via i18n */}
                        {rule.conditions.length} condition
                        {rule.conditions.length === 1 ? '' : 's'} (
                        {rule.conditionLogic === 'or' ? 'ANY' : 'ALL'})
                      </Text>
                      <Text size="xs" c="dimmed">
                        →
                      </Text>
                      <Badge size="xs" variant="light">
                        {getCategoryName(rule.resultCategoryId)}
                      </Badge>
                    </Group>
                  </Stack>
                </Group>

                <Group gap="xs" wrap="nowrap">
                  <Switch
                    size="sm"
                    checked={rule.isActive}
                    onChange={() => handleToggleActive(rule)}
                  />
                  <Menu shadow="md" width={200}>
                    <Menu.Target>
                      <ActionIcon variant="subtle">
                        <IconDotsVertical size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconEdit size={14} />}
                        onClick={() =>
                          navigate({
                            to: '/categories/rules/$id/edit',
                            params: { id: rule.id },
                          })
                        }
                      >
                        Edit
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Item
                        color="red"
                        leftSection={<IconTrash size={14} />}
                        onClick={() => handleDelete(rule.id)}
                      >
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
