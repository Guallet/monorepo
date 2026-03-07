import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Stack, Title } from '@mantine/core';
import { notifications } from '@/lib/notifications';
import { useState } from 'react';
import { RuleForm, RuleFormData } from '@/features/rules/components/RuleForm';
import { useFieldDefinitions, useRuleMutations } from '@guallet/api-react';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/_app/categories/rules/new')({
  component: NewRulePage,
});

function NewRulePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { fieldDefinitions } = useFieldDefinitions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createRuleMutation } = useRuleMutations();

  const handleSubmit = async (data: RuleFormData) => {
    try {
      setIsSubmitting(true);

      await createRuleMutation.mutateAsync({
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
        title: t('screens.rules.create.notifications.success.title'),
        message: t('screens.rules.create.notifications.success.message'),
        color: 'green',
      });
      navigate({ to: '/categories/rules' });
    } catch (error) {
      console.error(error);
      notifications.show({
        title: t('screens.rules.create.notifications.error.title'),
        message: t('screens.rules.create.notifications.error.message'),
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
    <Stack gap="md">
      <Title order={2}>{t('screens.rules.create.title')}</Title>
      <RuleForm
        fieldDefinitions={fieldDefinitions}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        submitLabel={t('screens.rules.create.submitButton.label')}
      />
    </Stack>
  );
}
