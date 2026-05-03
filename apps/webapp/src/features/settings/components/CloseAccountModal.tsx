import {
  Box,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useTheme } from '@guallet/ui-react';
import { IconAlertTriangle, IconTrash } from '@tabler/icons-react';

const CONFIRMATION_TEXT = 'close my account';

interface CloseAccountModalProps {
  opened: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function CloseAccountModal({
  opened,
  isLoading,
  onClose,
  onConfirm,
}: Readonly<CloseAccountModalProps>) {
  const { t } = useTranslation();
  const { borderRadius, colors, spacing, typography } = useTheme();
  const [confirmation, setConfirmation] = useState('');
  const isConfirmed = confirmation === CONFIRMATION_TEXT;

  function handleClose() {
    setConfirmation('');
    onClose();
  }

  function handleConfirm() {
    if (!isConfirmed) {
      return;
    }

    onConfirm();
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Box>
          <Text fw={700}>
            {t('screens.settings.closeAccountModal.title', 'Close account')}
          </Text>
          <Text c="dimmed" fw={600}>
            {t(
              'screens.settings.closeAccountModal.subtitle',
              'This action is permanent and cannot be undone',
            )}
          </Text>
        </Box>
      }
      closeButtonProps={{}}
      styles={{
        header: {
          borderBottom: `1px solid ${colors.paleGrey}`,
          padding: spacing.lg,
        },
        body: {
          padding: spacing.lg,
        },
      }}
    >
      <Stack gap={spacing.lg}>
        <Group
          align="flex-start"
          gap={spacing.md}
          wrap="nowrap"
          p={spacing.lg}
          style={{
            backgroundColor: `color-mix(in oklab, ${colors.error} 8%, ${colors.white})`,
            border: `1px solid color-mix(in oklab, ${colors.error} 28%, ${colors.white})`,
            borderRadius: borderRadius.md,
            color: colors.error,
          }}
        >
          <IconAlertTriangle size={28} strokeWidth={1.5} />
          <Text>
            <Text component="span" inherit fw={700}>
              {t(
                'screens.settings.closeAccountModal.warning.strong',
                'All your data will be permanently deleted.',
              )}
            </Text>{' '}
            {t(
              'screens.settings.closeAccountModal.warning.body',
              'This includes all accounts, transactions, budgets, and goals. There is no recovery option.',
            )}
          </Text>
        </Group>

        <Stack gap={spacing.xs}>
          <Text fw={600}>
            {t(
              'screens.settings.closeAccountModal.confirmation.prefix',
              'Type',
            )}{' '}
            <Text
              component="span"
              inherit
              fw={700}
              px={spacing.xs}
              style={{
                backgroundColor: colors.paleGrey,
                borderRadius: borderRadius.sm,
                fontFamily: typography.fontFamilyMono,
              }}
            >
              {CONFIRMATION_TEXT}
            </Text>{' '}
            {t(
              'screens.settings.closeAccountModal.confirmation.suffix',
              'to continue',
            )}
          </Text>
          <TextInput
            value={confirmation}
            onChange={(event) => {
              setConfirmation(event.currentTarget.value);
            }}
            placeholder={CONFIRMATION_TEXT}
            size="md"
            autoFocus
            disabled={isLoading}
          />
        </Stack>

        <Group justify="flex-end" gap={spacing.sm}>
          <Button variant="default" onClick={handleClose} disabled={isLoading}>
            {t(
              'screens.settings.closeAccountModal.keepAccountButton.label',
              'Keep my account',
            )}
          </Button>
          <Button
            color="red"
            leftSection={<IconTrash size={18} strokeWidth={1.5} />}
            disabled={!isConfirmed}
            loading={isLoading}
            onClick={handleConfirm}
          >
            {t(
              'screens.settings.closeAccountModal.closeAccountButton.label',
              'Close account',
            )}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
