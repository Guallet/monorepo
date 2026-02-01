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
  Loader,
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
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/_app/categories/rules/')({
  component: RulesPage,
});

function RulesPage() {
  const { t } = useTranslation();
  const {
    rules,
    isLoading: isRulesLoading,
    isFetching: isRulesFetching,
  } = useRules();
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
        title: t('screens.rules.list.notifications.reorder.success.title'),
        message: t('screens.rules.list.notifications.reorder.success.message'),
        color: 'green',
      });
    } catch {
      notifications.show({
        title: t('screens.rules.list.notifications.reorder.error.title'),
        message: t('screens.rules.list.notifications.reorder.error.message'),
        color: 'red',
      });
    }
  };

  const handleDelete = async (ruleId: string) => {
    try {
      await deleteRuleMutation.mutateAsync({ id: ruleId });

      notifications.show({
        title: t('screens.rules.list.notifications.delete.success.title'),
        message: t('screens.rules.list.notifications.delete.success.message'),
        color: 'green',
      });
    } catch {
      notifications.show({
        title: t('screens.rules.list.notifications.delete.error.title'),
        message: t('screens.rules.list.notifications.delete.error.message'),
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
        title: t('screens.rules.list.notifications.toggle.success.title'),
        message: t('screens.rules.list.notifications.toggle.success.message', {
          action: rule.isActive
            ? t('common.disabled', 'disabled')
            : t('common.enabled', 'enabled'),
        }),
        color: 'green',
      });
    } catch {
      notifications.show({
        title: t('screens.rules.list.notifications.toggle.error.title'),
        message: t('screens.rules.list.notifications.toggle.error.message'),
        color: 'red',
      });
    }
  };

  const getPluralizedConditions = (count: number, logic: string) => {
    const conditionText = t('screens.rules.list.rule.conditions', { count });
    const logicText =
      logic === 'or'
        ? t('screens.rules.list.rule.conditions.logic.any')
        : t('screens.rules.list.rule.conditions.logic.all');
    return `${conditionText} (${logicText})`;
  };

  const renderContent = () => {
    if (isRulesLoading || isRulesFetching) {
      return (
        <Card withBorder p="xl" ta="center">
          <Group justify="center">
            <Loader />
          </Group>
        </Card>
      );
    }
    if (rules.length === 0) {
      return (
        <Card withBorder p="xl" ta="center">
          <Text c="dimmed">{t('screens.rules.list.emptyState.title')}</Text>
          <Button
            mt="md"
            variant="light"
            leftSection={<IconPlus size={16} />}
            onClick={() => navigate({ to: '/categories/rules/new' })}
          >
            {t('screens.rules.list.emptyState.createButton.label')}
          </Button>
        </Card>
      );
    }
    return (
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
                        {t('screens.rules.list.rule.disabled')}
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
                      {getPluralizedConditions(
                        rule.conditions.length,
                        rule.conditionLogic,
                      )}
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
                      {t('screens.rules.list.actions.edit')}
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      color="red"
                      leftSection={<IconTrash size={14} />}
                      onClick={() => handleDelete(rule.id)}
                    >
                      {t('screens.rules.list.actions.delete')}
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Group>
          </Card>
        ))}
      </Stack>
    );
  };

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Title order={2}>{t('screens.rules.list.title')}</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => navigate({ to: '/categories/rules/new' })}
        >
          {t('screens.rules.list.createButton.label')}
        </Button>
      </Group>

      <Text c="dimmed" size="sm">
        {t('screens.rules.list.description')}
      </Text>

      {renderContent()}
    </Stack>
  );
}
