import { ObInstitutionDto } from '@guallet/api-client';
import { useOpenBankingInstitutionsForCountry } from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import {
  Button,
  Card,
  Center,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconBuildingBank, IconSearch } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from './BackButton';
import { BankRow } from './BankRow';
import { WizardProgress } from './WizardProgress';

interface StepOBBankProps {
  countryCode: string;
  value: ObInstitutionDto | null;
  onChange: (institution: ObInstitutionDto | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepOBBank({
  countryCode,
  value,
  onChange,
  onNext,
  onBack,
}: Readonly<StepOBBankProps>) {
  const { t } = useTranslation();
  const { institutions, isLoading } = useOpenBankingInstitutionsForCountry(countryCode);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 150);
  const { colors } = useTheme();

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return institutions;
    const q = debouncedSearch.toLowerCase();
    return institutions.filter((b) => b.name.toLowerCase().includes(q));
  }, [institutions, debouncedSearch]);

  return (
    <Stack>
      <BackButton onClick={onBack} />
      <WizardProgress
        steps={[
          t('feature.accounts.add.obSteps.country', 'Country'),
          t('feature.accounts.add.obSteps.bank', 'Bank'),
          t('feature.accounts.add.obSteps.connecting', 'Connecting'),
        ]}
        current={1}
      />

      <Title order={4} mb={4}>
        {t('feature.accounts.add.obBank.title', 'Select your bank')}
      </Title>
      <Text size="sm" c="dimmed" mb="md">
        {t(
          'feature.accounts.add.obBank.subtitle',
          "You'll be redirected to your bank's secure login. Guallet only requests read-only access.",
        )}
      </Text>

      <TextInput
        placeholder={t('feature.accounts.add.obBank.searchPlaceholder', 'Search bank…')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftSection={<IconSearch size={16} />}
        mb="sm"
      />

      <Card withBorder radius="md" p={0} style={{ overflow: 'hidden' }}>
        <ScrollArea mah={380}>
          {isLoading ? (
            <Center p="xl">
              <Loader size="sm" />
            </Center>
          ) : filtered.length === 0 ? (
            <Center p="xl">
              <Text size="sm" c="dimmed">
                {search
                  ? t('feature.accounts.add.obBank.noResults', 'No banks found for "{{search}}"', {
                      search,
                    })
                  : t(
                      'feature.accounts.add.obBank.noInstitutions',
                      'No institutions available for this country',
                    )}
              </Text>
            </Center>
          ) : (
            filtered.map((bank, i) => (
              <BankRow
                key={bank.id}
                bank={bank}
                selected={value?.id === bank.id}
                last={i === filtered.length - 1}
                onClick={() => onChange(bank)}
              />
            ))
          )}
        </ScrollArea>
      </Card>

      <Card withBorder={false} p="md" radius="md" bg="gray.0" mt="xs">
        <Group gap="xs" align="flex-start">
          <IconBuildingBank size={16} color={colors.primary} style={{ flexShrink: 0, marginTop: 1 }} />
          <Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>
            {value
              ? t(
                  'feature.accounts.add.obBank.psd2Notice',
                  "You'll be redirected to {{bank}}'s secure website. Guallet requests read-only access via PSD2 Open Banking and never sees your login credentials.",
                  { bank: value.name },
                )
              : t(
                  'feature.accounts.add.obBank.psd2NoticeGeneric',
                  'Guallet requests read-only access via PSD2 Open Banking and never sees your login credentials.',
                )}
          </Text>
        </Group>
      </Card>

      <Button
        fullWidth
        onClick={onNext}
        variant={value ? 'filled' : 'light'}
        disabled={!value}
      >
        {value
          ? t('feature.accounts.add.obBank.connectTo', 'Connect to {{bank}}', {
              bank: value.name,
            })
          : t('feature.accounts.add.obBank.selectBank', 'Select a bank to continue')}
      </Button>
    </Stack>
  );
}
