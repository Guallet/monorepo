import { useState } from 'react';
import { Alert, Button, Group, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
  useClassificationMutations,
  useClassificationRun,
  useDecisionConnection,
} from '@guallet/api-react';
import { Link } from '@tanstack/react-router';
import { useTheme } from '@guallet/ui-react';
export function ClassifyInboxAction() {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const { connection } = useDecisionConnection();
  const [runId, setRunId] = useState<string>();
  const { run } = useClassificationMutations();
  const progress = useClassificationRun(runId);
  return (
    <Stack gap={spacing.sm}>
      {!connection?.isActive && (
        <Text size="sm">
          {t(
            'classification.rulesOnly',
            'Rules are checked without an external service.',
          )}{' '}
          <Link to="/settings/classification">
            {t('classification.configure', 'Configure a decision service')}
          </Link>
        </Text>
      )}
      <Group>
        <Button
          variant="outline"
          loading={
            run.isPending ||
            Boolean(runId && !progress.data?.complete && !progress.isError)
          }
          onClick={() =>
            run.mutate(
              { scope: 'inbox' },
              { onSuccess: (result) => setRunId(result.runId) },
            )
          }
        >
          {t('classification.run', 'Suggest inbox categories')}
        </Button>
        {progress.data && (
          <Text role="status">
            {t(
              'classification.progress',
              '{{processed}} reviewed, {{queued}} waiting, {{suggested}} suggested, {{failed}} failed.',
              progress.data,
            )}
          </Text>
        )}
      </Group>
      {(run.isError || progress.isError) && (
        <Alert>
          {t(
            'classification.runError',
            'Could not classify the inbox or load progress. Refresh and try again.',
          )}
        </Alert>
      )}
    </Stack>
  );
}
