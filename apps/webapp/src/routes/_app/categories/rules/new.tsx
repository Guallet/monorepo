import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Stack, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { RuleForm, RuleFormData } from '@/features/rules/components/RuleForm';
import { useFieldDefinitions, useRuleMutations } from '@guallet/api-react';

export const Route = createFileRoute('/_app/categories/rules/new')({
  component: NewRulePage,
});

function NewRulePage() {
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
        title: 'Success',
        message: 'Rule created successfully',
        color: 'green',
      });
      navigate({ to: '/categories/rules' });
    } catch (error) {
      console.error(error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create rule',
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
      <Title order={2}>Create New Rule</Title>
      <RuleForm
        fieldDefinitions={fieldDefinitions}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        submitLabel="Create Rule"
      />
    </Stack>
  );
}
