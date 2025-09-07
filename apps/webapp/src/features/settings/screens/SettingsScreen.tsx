import { Button, Stack, Title } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import { UserSettingsCard } from "../components/UserSettingsCard";
import { AppSection } from "@/components/Cards/AppSection";
import { LanguageRow } from "../components/LanguageRow";
import { DefaultCurrencyRow } from "../components/DefaultCurrencyRow";
import { PreferredCurrenciesRow } from "../components/PreferredCurrenciesRow";
import { DateFormatRow } from "../components/DateFormatRow";
import { BaseScreen } from "@/components/Screens/BaseScreen";

export function SettingsScreen() {
  const navigate = useNavigate();

  return (
    <BaseScreen>
      <Stack>
        <Title>Settings</Title>
        <UserSettingsCard />

        <AppSection title="Institutions">
          <Button
            onClick={() => {
              navigate({ to: "/settings/institutions" });
            }}
          >
            Manage institutions
          </Button>
        </AppSection>

        <Stack>
          <AppSection title="User Preferences" p={0}>
            <LanguageRow />
            <DefaultCurrencyRow />
            <PreferredCurrenciesRow />
            <DateFormatRow />
          </AppSection>
        </Stack>

        <Button>Export data</Button>
        <Button color="red">Close account</Button>
      </Stack>
    </BaseScreen>
  );
}
