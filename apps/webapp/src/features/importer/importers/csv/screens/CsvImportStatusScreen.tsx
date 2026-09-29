import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Badge,
  Button,
  Container,
  Group,
  Paper,
  Progress,
  Stack,
  Text,
} from '@mantine/core';
import {
  isPermanentImportStatusError,
  useImportStatus,
} from '@guallet/api-react';
import { useAuth } from '@guallet/auth';
import { useTheme } from '@guallet/ui-react';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { watchImportJob } from '@/features/importer/pendingImportJobs';

interface Props {
  jobId: string;
}

export function CsvImportStatusScreen({ jobId }: Readonly<Props>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { colors, spacing, borderRadius } = useTheme();
  const { userId } = useAuth();
  const { data: status, error, refetch } = useImportStatus(jobId, userId);
  const unavailable = isPermanentImportStatusError(error);

  useEffect(() => {
    watchImportJob(jobId, userId);
  }, [jobId, userId]);

  let statusLabel = t('screens.importer.status.processing', 'Processing');
  let statusColor = colors.accent.primary;
  if (status?.status === 'queued') {
    statusLabel = t('screens.importer.status.queued', 'Queued');
  }
  if (status?.status === 'completed') {
    if (status.failedCount > 0) {
      statusLabel = t(
        'screens.importer.status.partial',
        'Completed with errors',
      );
      statusColor = colors.status.warning;
    } else {
      statusLabel = t('screens.importer.status.completed', 'Completed');
      statusColor = colors.status.success;
    }
  }
  if (status?.status === 'failed') {
    statusLabel = t('screens.importer.status.failed', 'Failed');
    statusColor = colors.status.error;
  }
  if (unavailable) {
    statusLabel = t('screens.importer.status.statusUnavailable', 'Unavailable');
    statusColor = colors.status.warning;
  }

  let description = t(
    'screens.importer.status.background',
    'Your import is processing in the background. You can continue using Guallet while it runs.',
  );
  if (unavailable) {
    description = t(
      'screens.importer.status.noLongerAvailable',
      'We can no longer check this import. Review your transactions for the result.',
    );
  }
  if (!unavailable && status?.status === 'completed') {
    description = t(
      'screens.importer.status.finished',
      'Your import has finished. Review the results below.',
    );
  }
  if (!unavailable && status?.status === 'failed') {
    description = t(
      'screens.importer.status.stopped',
      'Your import stopped before it could finish. Review your transactions before trying again.',
    );
  }

  return (
    <BaseScreen title={t('screens.importer.status.title', 'Import progress')}>
      <Container size="sm">
        <Paper
          withBorder
          shadow="sm"
          radius="lg"
          p={spacing.lg}
          style={{ borderRadius: borderRadius.lg }}
        >
          <Stack gap={spacing.md}>
            <Group justify="space-between">
              <Text fw={600} size="lg">
                {t('screens.importer.status.csvTitle', 'CSV import')}
              </Text>
              <Badge color={statusColor}>{statusLabel}</Badge>
            </Group>
            <Text c="dimmed">{description}</Text>
            {!unavailable && status?.status === 'queued' && (
              <Text>
                {t('screens.importer.status.waiting', 'Waiting to start')}
              </Text>
            )}
            {!unavailable && status?.status === 'running' && (
              <>
                <Progress
                  value={Math.max(0, Math.min(100, status.progress))}
                  aria-label={t(
                    'screens.importer.status.progressLabel',
                    'Import progress',
                  )}
                />
                <Text>{`${status.progress}%`}</Text>
              </>
            )}
            {!unavailable && status?.status === 'completed' && (
              <Alert
                color={
                  status.failedCount > 0
                    ? colors.status.warning
                    : colors.status.success
                }
              >
                {t('screens.importer.status.result', {
                  defaultValue:
                    '{{processed}} transactions imported; {{failed}} rows failed.',
                  processed: status.processedCount,
                  failed: status.failedCount,
                })}
              </Alert>
            )}
            {!unavailable && status?.status === 'failed' && (
              <Alert color={colors.status.error}>
                {t(
                  'screens.importer.status.failure',
                  'The import could not be completed. Check your transactions before trying again.',
                )}
              </Alert>
            )}
            {error && (
              <Alert color={colors.status.warning}>
                {t(
                  'screens.importer.status.unavailable',
                  'Import status is unavailable right now. Check your transactions or try again.',
                )}
                <Button variant="subtle" onClick={() => void refetch()}>
                  {t('screens.importer.status.retry', 'Retry')}
                </Button>
              </Alert>
            )}
            {status?.status !== 'completed' && status?.status !== 'failed' && (
              <Text size="sm" c="dimmed">
                {t(
                  'screens.importer.status.email',
                  'We’ll email you the results when processing finishes.',
                )}
              </Text>
            )}
            <Button onClick={() => void navigate({ to: '/dashboard' })}>
              {t('screens.importer.status.dashboard', 'Go to dashboard')}
            </Button>
          </Stack>
        </Paper>
      </Container>
    </BaseScreen>
  );
}
