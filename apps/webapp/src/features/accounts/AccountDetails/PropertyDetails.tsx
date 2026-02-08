import { AppSection } from '@/components/Cards/AppSection';
import { AccountDto, PropertyAccountProperties } from '@guallet/api-client';
import { Stack, Group, Text, Badge, Divider } from '@mantine/core';
import {
  IconHome,
  IconCalendar,
  IconCurrencyPound,
  IconMapPin,
  IconNotes,
  IconBuildingBank,
} from '@tabler/icons-react';
import { Money } from '@guallet/money';
import { useAccount } from '@guallet/api-react';

interface Props {
  account: AccountDto;
}

export function PropertyDetails({ account }: Readonly<Props>) {
  const properties = account.properties as PropertyAccountProperties | null;

  const { account: linkedMortgage } = useAccount(
    properties?.linkedMortgageAccountId || '',
  );

  if (!properties) {
    return (
      <AppSection title="Property Details">
        <Text c="dimmed">No property details available</Text>
      </AppSection>
    );
  }

  const purchasePrice = Money.fromCurrencyCode({
    amount: properties.purchasePrice,
    currencyCode: account.currency,
  });

  const valuation = properties.mostRecentValuation
    ? Money.fromCurrencyCode({
        amount: properties.mostRecentValuation,
        currencyCode: account.currency,
      })
    : null;

  const purchaseDate = new Date(properties.purchaseDate).toLocaleDateString(
    'en-GB',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  );

  const equity = valuation
    ? Money.fromCurrencyCode({
        amount:
          properties.mostRecentValuation! -
          Math.abs(linkedMortgage?.balance.amount || 0),
        currencyCode: account.currency,
      })
    : null;

  return (
    <Stack gap="md">
      <AppSection title="Property Information">
        <Stack gap="sm">
          <Group gap="xs">
            <IconHome size={20} />
            <Text fw={500}>Property Type:</Text>
            <Badge
              variant="light"
              color={
                properties.propertyType === 'residential' ? 'blue' : 'green'
              }
            >
              {properties.propertyType === 'residential'
                ? 'Residential'
                : 'Buy-to-let'}
            </Badge>
          </Group>

          <Divider />

          <Group gap="xs">
            <IconCurrencyPound size={20} />
            <Text fw={500}>Purchase Price:</Text>
            <Text>{purchasePrice.format()}</Text>
          </Group>

          <Group gap="xs">
            <IconCalendar size={20} />
            <Text fw={500}>Purchase Date:</Text>
            <Text>{purchaseDate}</Text>
          </Group>

          {valuation && (
            <>
              <Divider />
              <Group gap="xs">
                <IconCurrencyPound size={20} />
                <Text fw={500}>Current Valuation:</Text>
                <Text>{valuation.format()}</Text>
              </Group>

              {equity && (
                <Group gap="xs">
                  <IconCurrencyPound size={20} />
                  <Text fw={500}>Estimated Equity:</Text>
                  <Text c={equity.amount >= 0 ? 'green' : 'red'} fw={700}>
                    {equity.format()}
                  </Text>
                </Group>
              )}
            </>
          )}

          {properties.postcode && (
            <>
              <Divider />
              <Group gap="xs">
                <IconMapPin size={20} />
                <Text fw={500}>Postcode:</Text>
                <Text>{properties.postcode}</Text>
              </Group>
            </>
          )}

          {linkedMortgage && (
            <>
              <Divider />
              <Group gap="xs">
                <IconBuildingBank size={20} />
                <Text fw={500}>Linked Mortgage:</Text>
                <Text>{linkedMortgage.name}</Text>
                <Badge variant="light" color="red">
                  {Money.fromCurrencyCode({
                    amount: linkedMortgage.balance.amount,
                    currencyCode: linkedMortgage.currency,
                  }).format()}
                </Badge>
              </Group>
            </>
          )}

          {properties.notes && (
            <>
              <Divider />
              <Stack gap="xs">
                <Group gap="xs">
                  <IconNotes size={20} />
                  <Text fw={500}>Notes:</Text>
                </Group>
                <Text size="sm" c="dimmed" style={{ whiteSpace: 'pre-wrap' }}>
                  {properties.notes}
                </Text>
              </Stack>
            </>
          )}
        </Stack>
      </AppSection>
    </Stack>
  );
}
