import { Stepper } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface BankConnectionProgressProps {
  active: number;
}

export function BankConnectionProgress({
  active,
}: Readonly<BankConnectionProgressProps>) {
  const { t } = useTranslation();
  return (
    <Stepper active={active} size="xs" allowNextStepsSelect={false}>
      <Stepper.Step label={t('openbanking.connections.provider', 'Provider')} />
      <Stepper.Step
        label={t('openbanking.connections.credentials', 'Credentials')}
      />
      <Stepper.Step label={t('openbanking.connections.accounts', 'Accounts')} />
    </Stepper>
  );
}
