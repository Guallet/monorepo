import { BaseScreen } from '@/components/Screens/BaseScreen';
import { RuleForm, RuleFormData } from '@/features/rules/components/RuleForm';
import { useFieldDefinitions, useRuleMutations } from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import { Box, Card, Group, Stack, Text, ThemeIcon } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconInfoCircle } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function NewRuleScreen() {
  const { t } = useTranslation();
  const { spacing } = useTheme();
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
    <BaseScreen
      isLoading={isSubmitting}
      title={t('screens.rules.create.title', 'Create rule')}
    >
      <Stack gap={spacing.md}>
        <Card withBorder shadow="sm" radius="lg" p={spacing.lg}>
          <Group gap={spacing.md} align="flex-start" wrap="nowrap">
            <ThemeIcon size={40} radius="md" variant="light" color="blue">
              <IconInfoCircle size={22} strokeWidth={1.5} />
            </ThemeIcon>
            <Box>
              <Text fw={600}>
                {t('screens.rules.create.intro.title', 'Automate categorisation')}
              </Text>
              <Text size="sm" c="dimmed" mt={spacing.xs}>
                {t(
                  'screens.rules.create.intro.description',
                  'Define the transaction details to match, then choose the category Guallet should assign.',
                )}
              </Text>
            </Box>
          </Group>
        </Card>

        <RuleForm
          fieldDefinitions={fieldDefinitions}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          submitLabel={t(
            'screens.rules.create.submitButton.label',
            'Create rule',
          )}
        />
      </Stack>
    </BaseScreen>
  );
}
