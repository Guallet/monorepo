import { useState } from 'react';
import { Alert, Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@guallet/ui-react';
import {
  useClassificationMutations,
  useClassificationStats,
  useDecisionConnection,
} from '@guallet/api-react';
import { CreateDecisionConnectionRequest } from '@guallet/api-client';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { DecisionConnectionForm } from '../components/DecisionConnectionForm';
export function ClassificationSettingsScreen() {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const { connection, isLoading, isError } = useDecisionConnection();
  const stats = useClassificationStats();
  const actions = useClassificationMutations();
  const [message, setMessage] = useState('');
  const [deleting, setDeleting] = useState(false);
  const busy =
    actions.create.isPending ||
    actions.update.isPending ||
    actions.test.isPending ||
    actions.remove.isPending;
  async function save(request: CreateDecisionConnectionRequest) {
    try {
      const result = await (connection
        ? actions.update.mutateAsync(request)
        : actions.create.mutateAsync(request));
      setMessage(
        result.lastTestStatus === 'ok'
          ? t('classification.saved', 'Connection saved and tested.')
          : t(
              'classification.inactive',
              'Connection saved inactive because the test failed. Check the address, credentials and service availability.',
            ),
      );
    } catch {
      setMessage(
        t(
          'classification.saveError',
          'Could not save the connection. Check the address and credentials.',
        ),
      );
    }
  }
  async function test(request?: CreateDecisionConnectionRequest) {
    try {
      const result = await actions.test.mutateAsync(request);
      setMessage(
        result.ok
          ? t('classification.testOk', 'Connection test passed.')
          : t(
              'classification.testError',
              'Connection test failed. Check the address, credentials and service availability.',
            ),
      );
    } catch {
      setMessage(
        t(
          'classification.testError',
          'Connection test failed. Check the address, credentials and service availability.',
        ),
      );
    }
  }
  return (
    <BaseScreen
      title={t('classification.title', 'Transaction classification')}
      isLoading={isLoading}
    >
      <Stack gap={spacing.md}>
        {isError && (
          <Alert>
            {t(
              'classification.loadError',
              'Could not load classification settings.',
            )}
          </Alert>
        )}
        {message && <Alert role="status">{message}</Alert>}
        {connection && !connection.isActive && (
          <Alert>
            {t(
              'classification.disabled',
              'Background suggestions are inactive. Enable them and save to test the connection again.',
            )}
          </Alert>
        )}
        {!isLoading && !isError && (
          <DecisionConnectionForm
            key={`${connection?.id ?? 'new'}-${connection?.lastTestAt ?? ''}`}
            connection={connection}
            busy={busy}
            onSave={(request) => {
              void save(request);
            }}
            onTest={(request) => {
              void test(request);
            }}
          />
        )}
        {stats.data && (
          <Text>
            {t(
              'classification.reviews',
              'Last 30 days: {{accepted}} accepted, {{rejected}} corrected, {{dismissed}} dismissed. These review counts are not measured accuracy.',
              stats.data,
            )}
          </Text>
        )}
        {connection && (
          <Button
            color="error"
            variant="outline"
            onClick={() => setDeleting(true)}
          >
            {t('classification.delete', 'Delete connection')}
          </Button>
        )}
      </Stack>
      <Modal
        opened={deleting}
        onClose={() => setDeleting(false)}
        title={t('classification.delete', 'Delete connection')}
      >
        <Stack gap={spacing.md}>
          <Text>
            {t(
              'classification.deleteHelp',
              'Delete saved credentials and stop provider suggestions? Existing review history will remain.',
            )}
          </Text>
          <Group>
            <Button variant="outline" onClick={() => setDeleting(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              color="error"
              loading={actions.remove.isPending}
              onClick={async () => {
                try {
                  await actions.remove.mutateAsync();
                  setDeleting(false);
                  setMessage(
                    t('classification.deleted', 'Connection deleted.'),
                  );
                } catch {
                  setMessage(
                    t(
                      'classification.deleteError',
                      'Could not delete the connection.',
                    ),
                  );
                }
              }}
            >
              {t('classification.delete', 'Delete connection')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </BaseScreen>
  );
}
