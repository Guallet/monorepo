import { useOpenBankingSupportedCountries } from '@guallet/api-react';
import { Button, Card, Center, Loader, ScrollArea, Stack, Text, TextInput, Title } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from './BackButton';
import { CountryRow } from './CountryRow';
import { WizardProgress } from './WizardProgress';

interface StepOBCountryProps {
  value: string;
  onChange: (code: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepOBCountry({
  value,
  onChange,
  onNext,
  onBack,
}: Readonly<StepOBCountryProps>) {
  const { t } = useTranslation();
  const { countries, isLoading } = useOpenBankingSupportedCountries();
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 150);

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return countries;
    const q = debouncedSearch.toLowerCase();
    return countries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
    );
  }, [countries, debouncedSearch]);

  const selectedCountry = countries.find((c) => c.code === value);

  return (
    <Stack>
      <BackButton onClick={onBack} />
      <WizardProgress
        steps={[
          t('feature.accounts.add.obSteps.country', 'Country'),
          t('feature.accounts.add.obSteps.bank', 'Bank'),
          t('feature.accounts.add.obSteps.connecting', 'Connecting'),
        ]}
        current={0}
      />

      <Title order={4} mb={4}>
        {t('feature.accounts.add.obCountry.title', 'Where is your bank?')}
      </Title>
      <Text size="sm" c="dimmed" mb="md">
        {t('feature.accounts.add.obCountry.subtitle', 'Select the country where your bank is based.')}
      </Text>

      <TextInput
        placeholder={t('feature.accounts.add.obCountry.searchPlaceholder', 'Search country…')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftSection={<IconSearch size={16} />}
        mb="sm"
      />

      <Card withBorder radius="md" p={0} style={{ overflow: 'hidden' }}>
        <ScrollArea mah={320}>
          {isLoading ? (
            <Center p="xl">
              <Loader size="sm" />
            </Center>
          ) : filtered.length === 0 ? (
            <Center p="xl">
              <Text size="sm" c="dimmed">
                {t('feature.accounts.add.obCountry.noResults', 'No results for "{{search}}"', {
                  search,
                })}
              </Text>
            </Center>
          ) : (
            filtered.map((country, i) => (
              <CountryRow
                key={country.code}
                country={country}
                selected={value === country.code}
                last={i === filtered.length - 1}
                onClick={() => onChange(country.code)}
              />
            ))
          )}
        </ScrollArea>
      </Card>

      <Button fullWidth mt="md" onClick={onNext} disabled={!value}>
        {selectedCountry
          ? t('feature.accounts.add.obCountry.continueWith', 'Continue with {{name}}', {
              name: selectedCountry.name,
            })
          : t('common.continue', 'Continue')}
      </Button>
    </Stack>
  );
}
