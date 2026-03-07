import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { IconEdit, IconGripVertical, IconPlus, IconTrash } from '@tabler/icons-react';
import { notifications } from '@/lib/notifications';
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
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground">{t('common.loading', 'Loading...')}</p>
        </Card>
      );
    }

    if (rules.length === 0) {
      return (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">{t('screens.rules.list.emptyState.title')}</p>
          <Button
            type="button"
            className="mt-4 gap-2"
            variant="outline"
            onClick={() => navigate({ to: '/categories/rules/new' })}
          >
            <IconPlus size={16} />
            {t('screens.rules.list.emptyState.createButton.label')}
          </Button>
        </Card>
      );
    }

    return (
      <div className="space-y-2">
        {rules.map((rule, index) => {
          const isRuleDisabled = rule.isActive === false;

          return (
            <Card
              key={rule.id}
              className="p-3"
              draggable
              onDragStart={(e) => handleDragStart(e, rule)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, rule)}
              style={{
                cursor: 'grab',
                opacity: draggedItem?.id === rule.id ? 0.5 : 1,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-start gap-2">
                  <span className="mt-1 text-muted-foreground">
                    <IconGripVertical size={16} />
                  </span>
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border px-2 text-xs">
                    #{index + 1}
                  </span>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{rule.name}</p>
                      {isRuleDisabled ? (
                        <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                          {t('screens.rules.list.rule.disabled')}
                        </span>
                      ) : null}
                    </div>

                    {rule.description ? (
                      <p className="truncate text-sm text-muted-foreground">
                        {rule.description}
                      </p>
                    ) : null}

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {getPluralizedConditions(
                          rule.conditions.length,
                          rule.conditionLogic,
                        )}
                      </span>
                      <span>{'->'}</span>
                      <span className="rounded-full border px-2 py-0.5 text-foreground">
                        {getCategoryName(rule.resultCategoryId)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Checkbox
                    checked={rule.isActive}
                    onCheckedChange={() => {
                      handleToggleActive(rule);
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      navigate({
                        to: '/categories/rules/$id/edit',
                        params: { id: rule.id },
                      })
                    }
                  >
                    <IconEdit size={14} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      handleDelete(rule.id);
                    }}
                  >
                    <IconTrash size={14} />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t('screens.rules.list.title')}
        </h2>
        <Button
          type="button"
          className="gap-2"
          onClick={() => navigate({ to: '/categories/rules/new' })}
        >
          <IconPlus size={16} />
          {t('screens.rules.list.createButton.label')}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        {t('screens.rules.list.description')}
      </p>

      {renderContent()}
    </div>
  );
}