import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { RuleForm, RuleFormData } from '@/features/rules/components/RuleForm';
import {
  useFieldDefinitions,
  useRule,
  useRuleMutations,
} from '@guallet/api-react';
import { useTranslation } from 'react-i18next';
import { BaseScreen } from '@/components/Screens/BaseScreen';

export const Route = createFileRoute('/_app/categories/rules/$id_/edit')({
  component: EditRulePage,
});

function EditRulePage() {
  const { t } = useTranslation();
  const { id } = Route.useParams();
  const { rule, isLoading: isRuleLoading } = useRule(id);
  const { fieldDefinitions, isLoading: isFieldsLoading } =
    useFieldDefinitions();
  const { updateRuleMutation } = useRuleMutations();

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialData: RuleFormData = {
    name: rule?.name ?? '',
    description: rule?.description ?? '',
    resultCategoryId: rule?.resultCategoryId ?? '',
    isActive: rule?.isActive ?? false,
    conditionLogic: rule?.conditionLogic ?? 'and',
    conditions:
      rule?.conditions.map((c) => ({
        id: c.id,
        field: c.field,
        operator: c.operator,
        value: c.value,
      })) ?? [],
  };

  const handleSubmit = async (data: RuleFormData) => {
    try {
      setIsSubmitting(true);

      await updateRuleMutation.mutateAsync({
        id,
        request: {
          name: data.name,
          description: data.description || undefined,
          resultCategoryId: data.resultCategoryId,
          isActive: data.isActive,
          conditionLogic: data.conditionLogic,
          conditions: data.conditions.map((c, index) => ({
            field: c.field,
            operator: c.operator,
            value: c.value,
            order: index,
          })),
        },
      });

      notifications.show({
        title: t('screens.rules.edit.notifications.success.title'),
        message: t('screens.rules.edit.notifications.success.message'),
        color: 'green',
      });
      navigate({ to: '/categories/rules' });
    } catch {
      notifications.show({
        title: t('screens.rules.edit.notifications.error.title'),
        message: t('screens.rules.edit.notifications.error.message'),
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate({ to: '/categories/rules' });
  };

  return (
    <BaseScreen
      isLoading={isRuleLoading || isFieldsLoading}
      title={rule?.name ?? t('screens.rules.edit.title')}
    >
      {!isRuleLoading && !isFieldsLoading && rule && (
        <RuleForm
          key={rule.id}
          initialData={initialData}
          fieldDefinitions={fieldDefinitions ?? []}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          submitLabel={t('screens.rules.edit.submitButton.label')}
        />
      )}
      {!isRuleLoading && !rule && <div>{t('screens.rules.edit.notFound')}</div>}
    </BaseScreen>
  );
}
