import {
  AccountDto,
  AccountTypeDto,
  CreditCardProperties,
  CurrentAccountProperties,
  LoanAccountProperties,
  MortgageAccountProperties,
  SavingAccountProperties,
} from '@guallet/api-client';
import { useTheme } from '@guallet/ui-react';
import { Button, Card, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

interface PropertyRowProps {
  label: string;
  value: string | number | null | undefined;
}

function PropertyRow({ label, value }: Readonly<PropertyRowProps>) {
  if (value == null) return null;
  return (
    <Stack gap={2}>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text fw={500}>{value}</Text>
    </Stack>
  );
}

interface AccountPropertiesCardProps {
  account: AccountDto;
}

export function AccountPropertiesCard({
  account,
}: Readonly<AccountPropertiesCardProps>) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const navigate = useNavigate();

  if (!account.properties) return null;

  const rows = buildPropertyRows(account, t);
  if (rows.length === 0) return null;

  return (
    <Card withBorder shadow="sm" radius="lg" padding={{ base: 'md', sm: 'lg' }}>
      <Group justify="space-between" mb={spacing.sm}>
        <Text fw={600}>
          {t('feature.accounts.details.properties.title', 'Account details')}
        </Text>
        <Button
          variant="subtle"
          size="xs"
          onClick={() =>
            navigate({
              to: '/accounts/$id/edit',
              params: { id: account.id },
            })
          }
        >
          {t('feature.accounts.details.properties.edit', 'Edit')}
        </Button>
      </Group>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={spacing.md}>
        {rows}
      </SimpleGrid>
    </Card>
  );
}

function buildPropertyRows(
  account: AccountDto,
  t: (key: string, fallback: string, opts?: Record<string, unknown>) => string,
): React.ReactNode[] {
  const { type, properties, currency } = account;

  switch (type) {
    case AccountTypeDto.CURRENT_ACCOUNT: {
      const p = properties as CurrentAccountProperties;
      return [
        p?.details?.accountNumber && (
          <PropertyRow
            key="accountNumber"
            label={t(
              'feature.accounts.details.properties.accountNumber',
              'Account number',
            )}
            value={p.details.accountNumber}
          />
        ),
        p?.details?.sortCode && (
          <PropertyRow
            key="sortCode"
            label={t(
              'feature.accounts.details.properties.sortCode',
              'Sort code',
            )}
            value={p.details.sortCode}
          />
        ),
        p?.overdraft != null && (
          <PropertyRow
            key="overdraft"
            label={t(
              'feature.accounts.details.properties.overdraft',
              'Overdraft limit',
            )}
            value={`${currency} ${p.overdraft}`}
          />
        ),
      ].filter(Boolean) as React.ReactNode[];
    }

    case AccountTypeDto.CREDIT_CARD: {
      const p = properties as CreditCardProperties;
      return [
        p?.accountNumber && (
          <PropertyRow
            key="accountNumber"
            label={t(
              'feature.accounts.details.properties.accountNumber',
              'Account number',
            )}
            value={p.accountNumber}
          />
        ),
        p?.interestRate != null && (
          <PropertyRow
            key="interestRate"
            label={t(
              'feature.accounts.details.properties.interestRate',
              'Interest rate',
            )}
            value={`${p.interestRate}%`}
          />
        ),
        p?.creditLimit != null && (
          <PropertyRow
            key="creditLimit"
            label={t(
              'feature.accounts.details.properties.creditLimit',
              'Credit limit',
            )}
            value={`${currency} ${p.creditLimit}`}
          />
        ),
        p?.cycleDay != null && (
          <PropertyRow
            key="cycleDay"
            label={t(
              'feature.accounts.details.properties.cycleDay',
              'Billing cycle day',
            )}
            value={p.cycleDay}
          />
        ),
      ].filter(Boolean) as React.ReactNode[];
    }

    case AccountTypeDto.SAVINGS: {
      const p = properties as SavingAccountProperties;
      return [
        p?.interestRate != null && (
          <PropertyRow
            key="interestRate"
            label={t(
              'feature.accounts.details.properties.interestRate',
              'Interest rate',
            )}
            value={`${p.interestRate}%`}
          />
        ),
      ].filter(Boolean) as React.ReactNode[];
    }

    case AccountTypeDto.MORTGAGE: {
      const p = properties as MortgageAccountProperties;
      return [
        p?.propertyValue != null && (
          <PropertyRow
            key="propertyValue"
            label={t(
              'feature.accounts.details.properties.propertyValue',
              'Property value',
            )}
            value={`${currency} ${p.propertyValue}`}
          />
        ),
        p?.mortgageAmount != null && (
          <PropertyRow
            key="mortgageAmount"
            label={t(
              'feature.accounts.details.properties.mortgageAmount',
              'Mortgage amount',
            )}
            value={`${currency} ${p.mortgageAmount}`}
          />
        ),
        p?.interestRate != null && (
          <PropertyRow
            key="interestRate"
            label={t(
              'feature.accounts.details.properties.interestRate',
              'Interest rate',
            )}
            value={`${p.interestRate}%`}
          />
        ),
        p?.termLength != null && (
          <PropertyRow
            key="termLength"
            label={t(
              'feature.accounts.details.properties.termLength',
              'Term length',
            )}
            value={t(
              'feature.accounts.details.properties.termLengthYears',
              '{{count}} years',
              { count: p.termLength },
            )}
          />
        ),
      ].filter(Boolean) as React.ReactNode[];
    }

    case AccountTypeDto.LOAN: {
      const p = properties as LoanAccountProperties;
      return [
        p?.loanAmount != null && (
          <PropertyRow
            key="loanAmount"
            label={t(
              'feature.accounts.details.properties.loanAmount',
              'Loan amount',
            )}
            value={`${currency} ${p.loanAmount}`}
          />
        ),
        p?.interestRate != null && (
          <PropertyRow
            key="interestRate"
            label={t(
              'feature.accounts.details.properties.interestRate',
              'Interest rate',
            )}
            value={`${p.interestRate}%`}
          />
        ),
        p?.termLength != null && (
          <PropertyRow
            key="termLength"
            label={t(
              'feature.accounts.details.properties.termLength',
              'Term length',
            )}
            value={t(
              'feature.accounts.details.properties.termLengthYears',
              '{{count}} years',
              { count: p.termLength },
            )}
          />
        ),
      ].filter(Boolean) as React.ReactNode[];
    }

    default:
      return [];
  }
}
