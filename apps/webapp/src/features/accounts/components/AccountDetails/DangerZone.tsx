import { DeleteDialogConfirmation } from '@/components/Dialogs/DeleteDialogConfirmation';
import { useAccountMutations } from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import { Button, Card, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface DangerZoneProps {
  accountId: string;
}

export function DangerZone({ accountId }: Readonly<DangerZoneProps>) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const navigate = useNavigate();
  const { deleteAccountMutation } = useAccountMutations();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  async function handleDelete() {
    try {
      await deleteAccountMutation.mutateAsync({ id: accountId });
      notifications.show({
        message: t(
          'feature.accounts.details.dangerZone.deleteSuccess',
          'Account deleted successfully.',
        ),
        color: 'green',
      });
      navigate({ to: '/accounts' });
    } catch {
      notifications.show({
        title: t(
          'feature.accounts.details.dangerZone.deleteError.title',
          'Error',
        ),
        message: t(
          'feature.accounts.details.dangerZone.deleteError.message',
          'Failed to delete account. Please try again.',
        ),
        color: 'red',
      });
    }
  }

  return (
    <>
      <DeleteDialogConfirmation
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title={t(
          'feature.accounts.details.dangerZone.deleteDialog.title',
          'Delete account',
        )}
        message={t(
          'feature.accounts.details.dangerZone.deleteDialog.message',
          'Are you sure you want to delete this account? This action cannot be undone.',
        )}
      />

      <Card
        withBorder
        shadow="sm"
        radius="lg"
        padding={{ base: 'md', sm: 'lg' }}
        style={{ borderColor: 'var(--mantine-color-red-3)' }}
      >
        <Text fw={600} c="red" mb={spacing.sm}>
          {t('feature.accounts.details.dangerZone.title', 'Danger zone')}
        </Text>
        <Button
          variant="outline"
          color="red"
          loading={deleteAccountMutation.isPending}
          onClick={() => setIsDeleteOpen(true)}
        >
          {t(
            'feature.accounts.details.dangerZone.deleteButton',
            'Delete account',
          )}
        </Button>
      </Card>
    </>
  );
}
