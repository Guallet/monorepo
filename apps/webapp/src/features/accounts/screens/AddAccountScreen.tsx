import { BankProvider } from '@guallet/api-client';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { AddAccountWizard } from '../components/AddAccountWizard/AddAccountWizard';

export function AddAccountScreen({
  initialProvider,
}: Readonly<{ initialProvider?: BankProvider }>) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <BaseScreen title={t('feature.accounts.add.title', 'New account')}>
      <AddAccountWizard
        initialProvider={initialProvider}
        onDone={() => navigate({ to: '/accounts' })}
      />
    </BaseScreen>
  );
}
