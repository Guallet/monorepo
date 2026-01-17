import { useInstitution, useInstitutionMutations } from '@guallet/api-react';
import InstitutionForm from '../components/InstitutionForm';
import { Stack, Title, Button, Group, Text, Alert } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { IconAlertTriangle } from '@tabler/icons-react';

interface EditInstitutionScreenProps {
  institutionId: string;
}

export function EditInstitutionScreen({
  institutionId,
}: Readonly<EditInstitutionScreenProps>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { institution, isLoading: isInstitutionLoading } =
    useInstitution(institutionId);
  const { updateInstitutionMutation } = useInstitutionMutations();

  function handleFormSubmit(data: {
    name: string;
    image_src: string;
    country: string;
  }) {
    updateInstitutionMutation.mutate(
      {
        id: institutionId,
        request: {
          name: data.name,
          image_src: data.image_src,
          country: data.country,
        },
      },
      {
        onSuccess: () => {
          notifications.show({
            title: t('feature.institutions.notifications.update.success.title'),
            message: t(
              'feature.institutions.notifications.update.success.message',
            ),
            color: 'green',
          });
          navigate({ to: '/institutions' });
        },
        onError: (error) => {
          console.error('Error updating institution:', error);
          notifications.show({
            title: t('feature.institutions.notifications.update.error.title'),
            message: t(
              'feature.institutions.notifications.update.error.message',
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

  const isLoading = isInstitutionLoading || updateInstitutionMutation.isPending;

  // Check if this is a system institution (user_id is null)
  const isSystemInstitution = institution?.user_id === null;

  if (isSystemInstitution) {
    return (
      <BaseScreen isLoading={isInstitutionLoading}>
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Title order={2}>{t('feature.institutions.edit.title')}</Title>
            <Button variant="light" onClick={handleCancel}>
              {t('common.cancel')}
            </Button>
          </Group>

          <Alert
            icon={<IconAlertTriangle size={16} />}
            title={t('feature.institutions.edit.systemInstitution.title')}
            color="yellow"
          >
            {t('feature.institutions.edit.systemInstitution.message')}
          </Alert>
        </Stack>
      </BaseScreen>
    );
  }

  return (
    <BaseScreen isLoading={isLoading}>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={2}>{t('feature.institutions.edit.title')}</Title>
          <Button variant="light" onClick={handleCancel}>
            {t('common.cancel')}
          </Button>
        </Group>

        <Text c="dimmed">{t('feature.institutions.edit.description')}</Text>

        <InstitutionForm
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          initialValues={institution || undefined}
          isLoading={updateInstitutionMutation.isPending}
        />
      </Stack>
    </BaseScreen>
  );
}
