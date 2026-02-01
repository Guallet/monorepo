import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Stack, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { RuleForm, RuleFormData } from '@/features/rules/components/RuleForm';
import {
  useFieldDefinitions,
  useRule,
  useRuleMutations,
} from '@guallet/api-react';

export const Route = createFileRoute('/_app/categories/rules/$id_/edit')({
  component: EditRulePage,
});

function EditRulePage() {
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
        title: 'Success',
        message: 'Rule updated successfully',
        color: 'green',
      });
      navigate({ to: '/categories/rules' });
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to update rule',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate({ to: '/categories/rules' });
  };

  if (isRuleLoading || isFieldsLoading) {
    return (
      <Stack gap="md">
        <Title order={2}>Edit Rule</Title>
        <div>Loading rule...</div>
      </Stack>
    );
  }

  if (!rule && !isRuleLoading) {
    return (
      <Stack gap="md">
        <Title order={2}>Edit Rule</Title>
        <div>Rule not found.</div>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <Title order={2}>Edit Rule</Title>
      <RuleForm
        key={rule?.id}
        initialData={initialData}
        fieldDefinitions={fieldDefinitions ?? []}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        submitLabel="Update Rule"
      />
    </Stack>
  );
}
