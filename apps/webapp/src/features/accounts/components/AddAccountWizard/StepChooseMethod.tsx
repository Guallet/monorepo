import { Box, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import {
  IconBuildingBank,
  IconCloudDownload,
  IconDatabaseImport,
  IconPlus,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { useNordigenCredentials } from '@guallet/api-react';
import { MethodCard } from './MethodCard';

interface StepChooseMethodProps {
  onChoose: (
    method: 'ob' | 'lunchflow' | 'banksync' | 'synci' | 'manual',
  ) => void;
}

export function StepChooseMethod({
  onChoose,
}: Readonly<StepChooseMethodProps>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    credentialStatus,
    isLoading: isNordigenCredentialsLoading,
    isError: isNordigenCredentialsError,
    refetch: refetchNordigenCredentials,
  } = useNordigenCredentials();
  const hasNordigenCredentials = credentialStatus?.configured === true;

  return (
    <Stack>
      <Box mb="md">
        <Title order={3} mb={4}>
          {t('feature.accounts.add.chooseMethod.title', 'Add an account')}
        </Title>
        <Text size="sm" c="dimmed">
          {t(
            'feature.accounts.add.chooseMethod.subtitle',
            "Choose how you'd like to connect your account",
          )}
        </Text>
      </Box>

      <Stack gap="sm">
        <MethodCard
          title={t(
            'feature.accounts.add.chooseMethod.synci.title',
            'Import from Synci',
          )}
          description={t(
            'feature.accounts.add.chooseMethod.synci.desc',
            'Import accounts connected to Synci using your own personal access token.',
          )}
          onClick={() => onChoose('synci')}
          icon={
            <ThemeIcon size={44} radius="sm" variant="light" color="cyan">
              <IconCloudDownload size={24} />
            </ThemeIcon>
          }
        />
        <MethodCard
          title={t(
            'feature.accounts.add.chooseMethod.bankSync.title',
            'Import from BankSync',
          )}
          description={t(
            'feature.accounts.add.chooseMethod.bankSync.desc',
            'Import accounts already connected to BankSync using your own API key.',
          )}
          onClick={() => onChoose('banksync')}
          icon={
            <ThemeIcon size={44} radius="sm" variant="light" color="teal">
              <IconDatabaseImport size={24} />
            </ThemeIcon>
          }
        />
        <MethodCard
          title={t(
            'feature.accounts.add.chooseMethod.lunchFlow.title',
            'Import from Lunch Flow',
          )}
          description={t(
            'feature.accounts.add.chooseMethod.lunchFlow.desc',
            'Import accounts already connected to your Lunch Flow account using your own API key.',
          )}
          onClick={() => onChoose('lunchflow')}
          icon={
            <ThemeIcon size={44} radius="sm" variant="light" color="blue">
              <IconCloudDownload size={24} />
            </ThemeIcon>
          }
        />
        <MethodCard
          title={t(
            'feature.accounts.add.chooseMethod.openBanking.title',
            'Connect via Open Banking',
          )}
          description={
            isNordigenCredentialsLoading
              ? t(
                  'feature.accounts.add.chooseMethod.openBanking.checkingCredentials',
                  'Checking Nordigen credentials…',
                )
              : hasNordigenCredentials
                ? t(
                    'feature.accounts.add.chooseMethod.openBanking.desc',
                    'Securely link your bank account. Balances and transactions sync automatically. Read-only — Guallet never moves money.',
                  )
                : t(
                    'feature.accounts.add.chooseMethod.openBanking.configureCredentials',
                    'Add your Nordigen credentials in Settings before connecting a bank.',
                  )
          }
          badge={t(
            'feature.accounts.add.chooseMethod.recommended',
            'Recommended',
          )}
          onClick={() => {
            if (isNordigenCredentialsLoading) return;
            if (isNordigenCredentialsError) {
              void refetchNordigenCredentials();
              return;
            }
            if (hasNordigenCredentials) {
              onChoose('ob');
            } else {
              void navigate({ to: '/settings' });
            }
          }}
          icon={
            <ThemeIcon size={44} radius="sm" variant="light" color="blue">
              <IconBuildingBank size={24} />
            </ThemeIcon>
          }
        />
        <MethodCard
          title={t(
            'feature.accounts.add.chooseMethod.manual.title',
            'Add manually',
          )}
          description={t(
            'feature.accounts.add.chooseMethod.manual.desc',
            'Enter your account details by hand. Perfect for cash wallets, crypto, foreign accounts or any bank not yet supported.',
          )}
          onClick={() => onChoose('manual')}
          icon={
            <ThemeIcon size={44} radius="sm" variant="light" color="gray">
              <IconPlus size={24} />
            </ThemeIcon>
          }
        />
      </Stack>
    </Stack>
  );
}
