import { useInstitutionMutations } from '@guallet/api-react';
import InstitutionForm from '../components/InstitutionForm';
import { Stack, Title, Button, Group, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

export function AddInstitutionScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createInstitutionMutation } = useInstitutionMutations();

  function handleFormSubmit(data: {
    name: string;
    image_src: string;
    country: string;
  }) {
    createInstitutionMutation.mutate(
      {
        request: {
          name: data.name,
          image_src: data.image_src,
          country: data.country,
        },
      },
      {
        onSuccess: () => {
          notifications.show({
            title: t('feature.institutions.notifications.create.success.title'),
            message: t(
              'feature.institutions.notifications.create.success.message',
            ),
            color: 'green',
          });
          navigate({ to: '/institutions' });
        },
        onError: (error) => {
          console.error('Error creating institution:', error);
          notifications.show({
            title: t('feature.institutions.notifications.create.error.title'),
            message: t(
              'feature.institutions.notifications.create.error.message',
            ),
            color: 'red',
          });
        },
      },
    );
  }

  function handleCancel() {
    navigate({ to: '/institutions' });
  }

  return (
    <BaseScreen isLoading={createInstitutionMutation.isPending}>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={2}>{t('feature.institutions.add.title')}</Title>
          <Button variant="light" onClick={handleCancel}>
            {t('common.cancel')}
          </Button>
        </Group>

        <Text c="dimmed">{t('feature.institutions.add.description')}</Text>

        <InstitutionForm
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          isLoading={createInstitutionMutation.isPending}
        />
      </Stack>
    </BaseScreen>
  );
}
