import { useBankConnectionMutations, useBankJob } from '@guallet/api-react';
import { Alert, Button, Stack, Text } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { BankOperationStatus } from '../components/BankOperationStatus';
interface BankAuthorizationCallbackScreenProps {
  connectionId?: string;
  authorizationId?: string;
}
export function BankAuthorizationCallbackScreen({
  connectionId,
  authorizationId,
}: Readonly<BankAuthorizationCallbackScreenProps>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { completeAuthorization } = useBankConnectionMutations();
  const job = useBankJob(connectionId, completeAuthorization.data?.jobId);
  const busy =
    completeAuthorization.isPending ||
    Boolean(
      completeAuthorization.data &&
      !job.isError &&
      job.data?.status !== 'completed' &&
      job.data?.status !== 'failed',
    );
  return (
    <BaseScreen
      title={t('openbanking.authorization.title', 'Bank authorization')}
    >
      <Stack>
        {!connectionId || !authorizationId ? (
          <Alert color="red">
            {t(
              'openbanking.authorization.invalid',
              'The bank authorization link is invalid. Please start again.',
            )}
          </Alert>
        ) : (
          <>
            <Text>
              {t(
                'openbanking.authorization.returned',
                'Continue to confirm your bank authorization and discover your accounts.',
              )}
            </Text>
            <Button
              loading={busy}
              disabled={job.data?.status === 'completed'}
              onClick={() =>
                completeAuthorization.mutate({
                  id: connectionId,
                  authorizationId,
                })
              }
            >
              {t('common.continue', 'Continue')}
            </Button>
            {completeAuthorization.isError && (
              <Alert color="red">
                {t(
                  'openbanking.authorization.incomplete',
                  'Authorization could not be confirmed. Complete it with your bank, or start again.',
                )}
              </Alert>
            )}
            <BankOperationStatus
              job={job.data}
              busy={busy}
              error={job.isError}
              onRetry={() => void job.refetch()}
            />
          </>
        )}
        <Button
          variant="outline"
          onClick={() => void navigate({ to: '/accounts/new' })}
        >
          {t('openbanking.authorization.import', 'Choose accounts to import')}
        </Button>
      </Stack>
    </BaseScreen>
  );
}
