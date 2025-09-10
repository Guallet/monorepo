import { Button, Stack, Title } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import { UserSettingsCard } from "../components/UserSettingsCard";
import { AppSection } from "@/components/Cards/AppSection";
import { LanguageRow } from "../components/LanguageRow";
import { DefaultCurrencyRow } from "../components/DefaultCurrencyRow";
import { PreferredCurrenciesRow } from "../components/PreferredCurrenciesRow";
import { DateFormatRow } from "../components/DateFormatRow";
import { BaseScreen } from "@/components/Screens/BaseScreen";
import { TextRow } from "@guallet/ui-react";

export function SettingsScreen() {
  const navigate = useNavigate();

  return (
    <BaseScreen>
      <Stack>
        <Title>Settings</Title>
        <UserSettingsCard />

        <AppSection title="User Preferences" gap={0}>
          <LanguageRow />
          <DefaultCurrencyRow />
          <PreferredCurrenciesRow />
          <DateFormatRow />
        </AppSection>

        <AppSection title="Institutions" gap={0}>
          <TextRow
            label="Manage institutions"
            onClick={() => {
              navigate({ to: "/institutions" });
            }}
          />
        </AppSection>

        <Button>Export data</Button>
        <Button color="red">Close account</Button>
      </Stack>
    </BaseScreen>
  );
}
