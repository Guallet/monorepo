import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { UserSettingsCard } from '../components/UserSettingsCard';
import { AppSection } from '@/components/Cards/AppSection';
import { LanguageRow } from '../components/LanguageRow';
import { DefaultCurrencyRow } from '../components/DefaultCurrencyRow';
import { PreferredCurrenciesRow } from '../components/PreferredCurrenciesRow';
import { DateFormatRow } from '../components/DateFormatRow';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { TextRow } from '@guallet/ui-react';

export function SettingsScreen() {
  const navigate = useNavigate();

  return (
    <BaseScreen>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <UserSettingsCard />

        <AppSection title="User Preferences" itemPadding={0}>
          <LanguageRow />
          <DefaultCurrencyRow />
          <PreferredCurrenciesRow />
          <DateFormatRow />
        </AppSection>

        <AppSection title="Institutions" itemPadding={0}>
          <TextRow
            label="Manage institutions"
            onClick={() => {
              navigate({ to: '/institutions' });
            }}
          />
        </AppSection>

        <AppSection title="Import/Export data" itemPadding={0}>
          <TextRow
            label="Export data"
            onClick={() => {
              navigate({ to: '/settings/export' });
            }}
          />
          <TextRow
            label="Import data"
            onClick={() => {
              navigate({ to: '/importer' });
            }}
          />
        </AppSection>

        <AppSection title="Danger zone">
          <Button
            variant="outline"
            className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            Close account
          </Button>
        </AppSection>
      </div>
    </BaseScreen>
  );
}
