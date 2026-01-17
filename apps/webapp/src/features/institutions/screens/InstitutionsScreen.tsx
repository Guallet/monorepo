import { useInstitutions, useInstitutionMutations } from '@guallet/api-react';
import InstitutionsTable from '../components/InstitutionsTable';
import { Stack, Group, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { AppSection } from '@/components/Cards/AppSection';
import { InstitutionDto } from '@guallet/api-client';
import { modals } from '@mantine/modals';
import { useTranslation } from 'react-i18next';

export function InstitutionsScreen() {
  const { t } = useTranslation();
  const { institutions, isLoading } = useInstitutions();
  const { deleteInstitutionMutation } = useInstitutionMutations();

  function handleDeleteClick(institution: InstitutionDto) {
    modals.openConfirmModal({
      title: t('feature.institutions.deleteConfirm.title'),
      children: t('feature.institutions.deleteConfirm.message', {
        name: institution.name,
      }),
      labels: {
        confirm: t('feature.institutions.deleteConfirm.confirmButton'),
        cancel: t('feature.institutions.deleteConfirm.cancelButton'),
      },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        deleteInstitutionMutation.mutate(
          { id: institution.id },
          {
            onSuccess: () => {
              notifications.show({
                title: t(
                  'feature.institutions.notifications.delete.success.title',
                ),
                message: t(
                  'feature.institutions.notifications.delete.success.message',
                ),
                color: 'green',
              });
            },
            onError: (error) => {
              console.error('Error deleting institution:', error);
              notifications.show({
                title: t(
                  'feature.institutions.notifications.delete.error.title',
                ),
                message: t(
                  'feature.institutions.notifications.delete.error.message',
                ),
                color: 'red',
              });
            },
          },
        );
      },
    });
  }

  return (
    <BaseScreen isLoading={isLoading || deleteInstitutionMutation.isPending}>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={2}>{t('feature.institutions.title')}</Title>
        </Group>

        <AppSection>
          <InstitutionsTable
            institutions={institutions}
            onDeleteClick={handleDeleteClick}
          />
        </AppSection>
      </Stack>
    </BaseScreen>
  );
}
