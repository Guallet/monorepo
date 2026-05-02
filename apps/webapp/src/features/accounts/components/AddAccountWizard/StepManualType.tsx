import { AccountTypeDto } from '@guallet/api-client';
import { Button, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { BackButton } from './BackButton';
import { TypeTile } from './TypeTile';
import { WizardProgress } from './WizardProgress';

const ACCOUNT_TYPES = [
  AccountTypeDto.CURRENT_ACCOUNT,
  AccountTypeDto.SAVINGS,
  AccountTypeDto.CREDIT_CARD,
  AccountTypeDto.INVESTMENT,
  AccountTypeDto.MORTGAGE,
  AccountTypeDto.LOAN,
];

interface StepManualTypeProps {
  value: AccountTypeDto;
  onChange: (type: AccountTypeDto) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepManualType({
  value,
  onChange,
  onNext,
  onBack,
}: Readonly<StepManualTypeProps>) {
  const { t } = useTranslation();

  return (
    <Stack>
      <BackButton onClick={onBack} />
      <WizardProgress
        steps={[
          t('feature.accounts.add.steps.type', 'Type'),
          t('feature.accounts.add.steps.details', 'Details'),
          t('feature.accounts.add.steps.done', 'Done'),
        ]}
        current={0}
      />

      <Title order={4} mb={4}>
        {t('feature.accounts.add.typeStep.title', 'What type of account?')}
      </Title>
      <Text size="sm" c="dimmed" mb="md">
        {t(
          'feature.accounts.add.typeStep.subtitle',
          'This helps Guallet categorise balances and transactions correctly.',
        )}
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2 }} mb="lg">
        {ACCOUNT_TYPES.map((type) => (
          <TypeTile
            key={type}
            type={type}
            selected={value === type}
            onClick={() => onChange(type)}
          />
        ))}
      </SimpleGrid>

      <Button fullWidth onClick={onNext} variant={value ? 'filled' : 'light'}>
        {t('common.continue', 'Continue')}
      </Button>
    </Stack>
  );
}
