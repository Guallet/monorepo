import { useState } from 'react';
import {
  Alert,
  Anchor,
  Breadcrumbs,
  Button,
  Card,
  Container,
  Group,
  MultiSelect,
  SegmentedControl,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { useAccounts, useMoneyFlowReport } from '@guallet/api-react';
import { Currency, ISO4217Currencies, Money } from '@guallet/money';
import { useTheme } from '@guallet/ui-react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { useTranslation } from 'react-i18next';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';
import { MoneyFlowCategoryAmounts } from '@/features/reports/components/MoneyFlowCategoryAmounts';
import { MoneyFlowChart } from '@/features/reports/components/MoneyFlowChart';
import {
  getMoneyFlowAmounts,
  type CategoryLevel,
} from '@/features/reports/models/moneyFlow';

export function MoneyFlowScreen() {
  const { t, i18n } = useTranslation();
  const { colors, spacing } = useTheme();
  const defaultCurrency = useDefaultCurrency();
  const [dateRange, setDateRange] = useState<[string, string]>(() => {
    const today = dayjs();
    return [
      today.startOf('month').format('YYYY-MM-DD'),
      today.endOf('month').format('YYYY-MM-DD'),
    ];
  });
  const [draftStart, setDraftStart] = useState<string | null>(null);
  const [accountIds, setAccountIds] = useState<string[]>([]);
  const [level, setLevel] = useState<CategoryLevel>('1');
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);

  const accountsQuery = useAccounts();
  const report = useMoneyFlowReport({
    startDate: dateRange[0],
    endDate: dateRange[1],
    accounts: [...accountIds].sort(),
  });

  const title = t('screens.reports.moneyFlow.title', 'Money flow');
  const currencyCodes = [
    ...new Set(report.data?.rows.map((row) => row.currency)),
  ]
    .filter(Boolean)
    .sort();
  const currencyCode =
    selectedCurrency && currencyCodes.includes(selectedCurrency)
      ? selectedCurrency
      : currencyCodes.includes(defaultCurrency)
        ? defaultCurrency
        : (currencyCodes[0] ?? defaultCurrency);
  const currency = Object.hasOwn(ISO4217Currencies, currencyCode)
    ? Currency.fromISOCode(currencyCode)
    : undefined;
  const amounts =
    report.data && currency
      ? getMoneyFlowAmounts(
          report.data.rows,
          currency,
          level,
          t('screens.reports.moneyFlow.uncategorised', 'Uncategorised'),
        )
      : undefined;
  const metrics = amounts
    ? [
        {
          label: t('screens.reports.moneyFlow.moneyIn', 'Money in'),
          amount: amounts.moneyIn,
        },
        {
          label: t('screens.reports.moneyFlow.moneyOut', 'Money out'),
          amount: amounts.moneyOut ? -amounts.moneyOut : 0,
        },
        {
          label: t('screens.reports.moneyFlow.netCashFlow', 'Net cash flow'),
          amount: amounts.net,
        },
      ]
    : [];

  const formatAmount = (amount: number) =>
    currency
      ? Money.from({
          amount: amount / 10 ** currency.decimalPlaces,
          currency,
        }).format(i18n.resolvedLanguage)
      : '';
  const categoryLevel = t(
    'screens.reports.moneyFlow.categoryLevel',
    'Category level',
  );

  return (
    <Container size="xl" px={0} py="xs">
      <Stack gap="md">
        <Breadcrumbs>
          <Anchor component={Link} to="/reports" size="sm">
            {t('screens.reports.title', 'Reports')}
          </Anchor>
          <Text size="sm" c="dimmed" aria-current="page">
            {title}
          </Text>
        </Breadcrumbs>
        <Group justify="space-between">
          <Title order={1}>{title}</Title>
          <Group gap="sm">
            <DatePickerInput
              type="range"
              aria-label={t(
                'screens.reports.moneyFlow.dateRange',
                'Date range',
              )}
              value={draftStart ? [draftStart, null] : dateRange}
              locale={i18n.resolvedLanguage ?? 'en'}
              valueFormat="D MMM YYYY"
              labelSeparator=" – "
              allowSingleDateInRange
              leftSection={<IconCalendar size={spacing.md} stroke={1.5} />}
              onChange={([start, end]) => {
                if (start && end) {
                  setDateRange([start, end]);
                  setDraftStart(null);
                } else {
                  setDraftStart(start);
                }
              }}
            />
            <MultiSelect
              aria-label={t('screens.reports.moneyFlow.accounts', 'Accounts')}
              placeholder={t(
                'screens.reports.moneyFlow.allAccounts',
                'All accounts',
              )}
              data={accountsQuery.accounts.map(({ id, name }) => ({
                value: id,
                label: name,
              }))}
              disabled={accountsQuery.isPending || accountsQuery.isError}
              value={accountIds}
              onChange={setAccountIds}
              clearable
              searchable
              maw={spacing.xxl * 7}
              nothingFoundMessage={t(
                'screens.reports.moneyFlow.noAccounts',
                'No accounts found',
              )}
            />
            {currencyCodes.length > 1 && (
              <Select
                aria-label={t('screens.reports.moneyFlow.currency', 'Currency')}
                data={currencyCodes}
                value={currencyCode}
                onChange={setSelectedCurrency}
                allowDeselect={false}
                w={spacing.xxl * 3}
              />
            )}
          </Group>
        </Group>
        {accountsQuery.isError && (
          <Alert color="error">
            <Group justify="space-between">
              <Text size="sm">
                {t(
                  'screens.reports.moneyFlow.accountsError',
                  'Could not load accounts.',
                )}
              </Text>
              <Button
                variant="subtle"
                size="compact-sm"
                onClick={() => void accountsQuery.refetch()}
              >
                {t('screens.reports.moneyFlow.retry', 'Retry')}
              </Button>
            </Group>
          </Alert>
        )}
        {report.isPending && (
          <Stack
            role="status"
            aria-label={t(
              'screens.reports.moneyFlow.loading',
              'Loading money flow',
            )}
          >
            <SimpleGrid cols={{ base: 1, xs: 3 }}>
              {[0, 1, 2].map((item) => (
                <Skeleton key={item} height={spacing.xxl * 2} radius="lg" />
              ))}
            </SimpleGrid>
            <Skeleton height={spacing.xxl * 11} radius="lg" />
          </Stack>
        )}
        {report.isError && (
          <Alert color="error">
            <Group justify="space-between">
              <Text size="sm">
                {t(
                  'screens.reports.moneyFlow.loadError',
                  'Could not load the money flow report.',
                )}
              </Text>
              <Button
                variant="subtle"
                size="compact-sm"
                onClick={() => void report.refetch()}
              >
                {t('screens.reports.moneyFlow.retry', 'Retry')}
              </Button>
            </Group>
          </Alert>
        )}
        {report.isSuccess && !currency && (
          <Alert color="warning">
            {t(
              'screens.reports.moneyFlow.unsupportedCurrency',
              'Amounts in {{currency}} cannot be displayed.',
              { currency: currencyCode },
            )}
          </Alert>
        )}
        {amounts && (
          <>
            <SimpleGrid cols={{ base: 1, xs: 3 }}>
              {metrics.map(({ label, amount }) => (
                <Card
                  key={label}
                  withBorder
                  shadow="sm"
                  radius="lg"
                  padding="lg"
                >
                  <Text size="sm" c={colors.neutral.darkGrey}>
                    {label}
                  </Text>
                  <Text
                    size="xl"
                    fw={700}
                    c={
                      amount < 0
                        ? colors.status.error
                        : amount > 0
                          ? colors.support.dark
                          : undefined
                    }
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatAmount(amount)}
                  </Text>
                </Card>
              ))}
            </SimpleGrid>
            <Card
              withBorder
              shadow="sm"
              radius="lg"
              p={{ base: 'md', md: 'lg' }}
            >
              <Stack gap="lg">
                <Group justify="space-between">
                  <Title order={2} size="lg">
                    {t(
                      'screens.reports.moneyFlow.byCategory',
                      'Cash flow by category',
                    )}
                  </Title>
                  <Group gap="sm">
                    <Text size="sm" c="dimmed">
                      {categoryLevel}
                    </Text>
                    <SegmentedControl<CategoryLevel>
                      aria-label={categoryLevel}
                      value={level}
                      onChange={setLevel}
                      radius="md"
                      data={[
                        {
                          label: t(
                            'screens.reports.moneyFlow.levelOne',
                            'Level 1',
                          ),
                          value: '1',
                        },
                        {
                          label: t(
                            'screens.reports.moneyFlow.levelTwo',
                            'Level 2',
                          ),
                          value: '2',
                        },
                      ]}
                    />
                  </Group>
                </Group>
                {amounts.categories.length > 0 ? (
                  <>
                    <MoneyFlowChart
                      amounts={amounts}
                      formatAmount={formatAmount}
                    />
                    <MoneyFlowCategoryAmounts
                      categories={amounts.categories}
                      formatAmount={formatAmount}
                    />
                  </>
                ) : (
                  <Text c="dimmed" ta="center" py="xl">
                    {t(
                      'screens.reports.moneyFlow.empty',
                      'No money moved in the selected period.',
                    )}
                  </Text>
                )}
              </Stack>
            </Card>
          </>
        )}
      </Stack>
    </Container>
  );
}
