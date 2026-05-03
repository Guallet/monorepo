import { BaseScreen } from '@/components/Screens/BaseScreen';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { Category } from '@/features/categories/models/Category';
import { RuleDto } from '@guallet/api-client';
import { useCategories, useRuleMutations, useRules } from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Loader,
  Menu,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconArrowRight,
  IconCircleCheck,
  IconDotsVertical,
  IconEdit,
  IconGripVertical,
  IconInfoCircle,
  IconListCheck,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { DragEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function RulesListScreen() {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
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
  const activeRules = rules.filter((rule) => rule.isActive).length;
  const inactiveRules = rules.length - activeRules;

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((c: Category) => c.id === categoryId);
    return category?.name ?? 'Unknown Category';
  };

  const handleDragStart = (e: DragEvent, rule: RuleDto) => {
    setDraggedItem(rule);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: DragEvent, targetRule: RuleDto) => {
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
        <Card withBorder shadow="sm" radius="lg" p={spacing.xl} ta="center">
          <Group justify="center">
            <Loader />
          </Group>
        </Card>
      );
    }
    if (rules.length === 0) {
      return (
        <EmptyState
          illustration={
            <IconListCheck
              size={48}
              strokeWidth={1.5}
              color={colors.midGrey}
            />
          }
          title={t(
            'screens.rules.list.emptyState.title',
            'No rules created yet',
          )}
          description={t(
            'screens.rules.list.emptyState.description',
            'Create a rule to automatically categorise matching transactions.',
          )}
          primaryAction={{
            label: t(
              'screens.rules.list.emptyState.createButton.label',
              'Create your first rule',
            ),
            icon: <IconPlus size={16} strokeWidth={1.5} />,
            onClick: () => navigate({ to: '/categories/rules/new' }),
          }}
          traits={[
            {
              title: t(
                'screens.rules.list.emptyState.trait1.title',
                'Match transactions',
              ),
              body: t(
                'screens.rules.list.emptyState.trait1.body',
                'Choose fields such as merchant, amount, or account.',
              ),
            },
            {
              title: t(
                'screens.rules.list.emptyState.trait2.title',
                'Assign a category',
              ),
              body: t(
                'screens.rules.list.emptyState.trait2.body',
                'Send every match to the category you select.',
              ),
            },
            {
              title: t(
                'screens.rules.list.emptyState.trait3.title',
                'Control priority',
              ),
              body: t(
                'screens.rules.list.emptyState.trait3.body',
                'Rules run from top to bottom, so order matters.',
              ),
            },
          ]}
        />
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
              backgroundColor: colors.white,
            }}
          >
            <Group justify="space-between" wrap="nowrap">
              <Group gap="sm" wrap="nowrap" style={{ flex: 1 }}>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  aria-label={t(
                    'screens.rules.list.rule.dragHandle',
                    'Drag to reorder',
                  )}
                  style={{ cursor: 'grab' }}
                >
                  <IconGripVertical size={20} strokeWidth={1.5} />
                </ActionIcon>
                <ThemeIcon size={40} radius="md" variant="light" color="blue">
                  <IconCircleCheck size={22} strokeWidth={1.5} />
                </ThemeIcon>
                <Stack gap={spacing.xs} style={{ flex: 1 }}>
                  <Group gap="xs">
                    <Text fw={500}>{rule.name}</Text>
                    <Badge size="sm" variant="light" color="gray">
                      {t('screens.rules.list.rule.priority', 'Priority {{index}}', {
                        index: index + 1,
                      })}
                    </Badge>
                    <Badge
                      size="sm"
                      variant="light"
                      color={rule.isActive ? 'green' : 'gray'}
                    >
                      {rule.isActive
                        ? t('screens.rules.list.rule.active', 'Active')
                        : t('screens.rules.list.rule.disabled', 'Disabled')}
                    </Badge>
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
                    <IconArrowRight
                      size={16}
                      strokeWidth={1.5}
                      color={colors.midGrey}
                    />
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
                  aria-label={t(
                    'screens.rules.list.actions.toggleActive',
                    'Toggle rule active state',
                  )}
                  onChange={() => handleToggleActive(rule)}
                />
                <Menu shadow="md" width={200}>
                  <Menu.Target>
                    <ActionIcon
                      variant="subtle"
                      aria-label={t(
                        'screens.rules.list.actions.openMenu',
                        'Open rule actions',
                      )}
                    >
                      <IconDotsVertical size={20} strokeWidth={1.5} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconEdit size={16} strokeWidth={1.5} />}
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
                      leftSection={<IconTrash size={16} strokeWidth={1.5} />}
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
    <BaseScreen
      isLoading={isRulesLoading}
      title={t('screens.rules.list.title', 'Categorisation rules')}
      actions={
        <Button
          leftSection={<IconPlus size={16} strokeWidth={1.5} />}
          onClick={() => navigate({ to: '/categories/rules/new' })}
        >
          {t('screens.rules.list.createButton.label', 'Create rule')}
        </Button>
      }
    >
      <Stack gap={spacing.md}>
        <Card withBorder shadow="sm" radius="lg" p={spacing.lg}>
          <Group gap={spacing.md} align="flex-start" wrap="nowrap">
            <ThemeIcon size={40} radius="md" variant="light" color="blue">
              <IconInfoCircle size={22} strokeWidth={1.5} />
            </ThemeIcon>
            <Box>
              <Text fw={600}>
                {t('screens.rules.list.intro.title', 'Rule order matters')}
              </Text>
              <Text c="dimmed" size="sm" mt={spacing.xs}>
                {t(
                  'screens.rules.list.description',
                  'Rules are evaluated from top to bottom. Drag them into priority order; the first matching rule categorises the transaction.',
                )}
              </Text>
            </Box>
          </Group>
        </Card>

        {!isRulesLoading && rules.length > 0 && (
          <SimpleGrid
            cols={{ base: 1, sm: 3 }}
            spacing={spacing.md}
            visibleFrom="sm"
          >
            <Card withBorder shadow="sm" radius="lg" p={spacing.md}>
              <Text size="xs" tt="uppercase" fw={600} c="dimmed">
                {t('screens.rules.list.summary.total', 'Total rules')}
              </Text>
              <Text fz={24} fw={700} mt={spacing.xs}>
                {rules.length}
              </Text>
            </Card>
            <Card withBorder shadow="sm" radius="lg" p={spacing.md}>
              <Text size="xs" tt="uppercase" fw={600} c="dimmed">
                {t('screens.rules.list.summary.active', 'Active')}
              </Text>
              <Text fz={24} fw={700} mt={spacing.xs} c={colors.support}>
                {activeRules}
              </Text>
            </Card>
            <Card withBorder shadow="sm" radius="lg" p={spacing.md}>
              <Text size="xs" tt="uppercase" fw={600} c="dimmed">
                {t('screens.rules.list.summary.inactive', 'Inactive')}
              </Text>
              <Text fz={24} fw={700} mt={spacing.xs} c={colors.midGrey}>
                {inactiveRules}
              </Text>
            </Card>
          </SimpleGrid>
        )}

        {renderContent()}
      </Stack>
    </BaseScreen>
  );
}
