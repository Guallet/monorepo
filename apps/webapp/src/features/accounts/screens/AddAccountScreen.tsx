import { BaseScreen } from '@/components/Screens/BaseScreen';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { AddAccountWizard } from '../components/AddAccountWizard/AddAccountWizard';

export function AddAccountScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <BaseScreen title={t('feature.accounts.add.title', 'New account')}>
      <AddAccountWizard onDone={() => navigate({ to: '/accounts' })} />
    </BaseScreen>
  );
}
