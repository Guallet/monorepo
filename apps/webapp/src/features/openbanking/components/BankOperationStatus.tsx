import { BankJobStatusDto } from '@guallet/api-client';
import { Alert, Button, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
interface BankOperationStatusProps {
  job?: BankJobStatusDto;
  busy: boolean;
  error: boolean;
  onRetry?: () => void;
}
export function BankOperationStatus({
  job,
  busy,
  error,
  onRetry,
}: Readonly<BankOperationStatusProps>) {
  const { t } = useTranslation();
  if (error)
    return (
      <Alert color="red">
        {t(
          'openbanking.job.requestError',
          'Could not check the operation. It may still be running.',
        )}
        {onRetry && (
          <Button variant="subtle" onClick={onRetry}>
            {t('common.retry', 'Retry')}
          </Button>
        )}
      </Alert>
    );
  if (job?.status === 'failed')
    return (
      <Alert color="red">
        {t(
          'openbanking.job.failed',
          'The operation failed. Check your provider connection, then refresh and try again.',
        )}
      </Alert>
    );
  if (busy)
    return (
      <Text role="status">
        {t(
          'openbanking.job.running',
          'Working with your bank provider. This can take a few minutes…',
        )}
      </Text>
    );
  if (job?.status === 'completed') {
    if (job.result?.errors?.length)
      return (
        <Alert color="yellow">
          {t(
            'openbanking.job.partial',
            'Some accounts could not be synced. Check their status with your provider and try again.',
          )}
        </Alert>
      );
    return (
      <Alert color="green">
        {t('openbanking.job.completed', 'Operation completed.')}
      </Alert>
    );
  }
  return null;
}
