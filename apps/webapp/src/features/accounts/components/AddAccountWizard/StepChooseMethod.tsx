import { Box, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconBuildingBank, IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { MethodCard } from './MethodCard';

interface StepChooseMethodProps {
  onChoose: (method: 'ob' | 'manual') => void;
}

export function StepChooseMethod({ onChoose }: Readonly<StepChooseMethodProps>) {
  const { t } = useTranslation();

  return (
    <Stack>
      <Box mb="md">
        <Title order={3} mb={4}>
          {t('feature.accounts.add.chooseMethod.title', 'Add an account')}
        </Title>
        <Text size="sm" c="dimmed">
          {t('feature.accounts.add.chooseMethod.subtitle', "Choose how you'd like to connect your account")}
        </Text>
      </Box>

      <Stack gap="sm">
        <MethodCard
          title={t('feature.accounts.add.chooseMethod.openBanking.title', 'Connect via Open Banking')}
          description={t(
            'feature.accounts.add.chooseMethod.openBanking.desc',
            'Securely link your bank account. Balances and transactions sync automatically. Read-only — Guallet never moves money.',
          )}
          badge={t('feature.accounts.add.chooseMethod.recommended', 'Recommended')}
          onClick={() => onChoose('ob')}
          icon={
            <ThemeIcon size={44} radius="sm" variant="light" color="blue">
              <IconBuildingBank size={24} />
            </ThemeIcon>
          }
        />
        <MethodCard
          title={t('feature.accounts.add.chooseMethod.manual.title', 'Add manually')}
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
