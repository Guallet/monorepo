import { BaseScreen } from '@/components/Screens/BaseScreen';
import { DateRangeButton } from '@/components/DateRangeButton/DateRangeButton';
import { useAccount, useAccountCharts } from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import { Box, Button, Stack } from '@mantine/core';
import { notFound, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccountDetailsHeader } from '../components/AccountDetailsHeader';
import { AccountPropertiesCard } from '../components/AccountDetails/AccountPropertiesCard';
import { BalanceTrendChart } from '../components/AccountDetails/BalanceTrendChart';
import { DangerZone } from '../components/AccountDetails/DangerZone';
import { MonthlyInOutChart } from '../components/AccountDetails/MonthlyInOutChart';
import { OpenBankingCard } from '../components/AccountDetails/OpenBankingCard';
import { TransactionsSection } from '../components/AccountDetails/TransactionsSection';

type DateRange = { startDate: Date; endDate: Date };

interface AccountDetailsScreenProps {
  accountId: string;
}

function defaultDateRange(): DateRange {
  const endDate = new Date();
  const startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  return { startDate, endDate };
}

export function AccountDetailsScreen({
  accountId,
}: Readonly<AccountDetailsScreenProps>) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const navigate = useNavigate();
  const { account, isLoading } = useAccount(accountId);
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange);

  const { data: chartData, isLoading: isChartLoading } = useAccountCharts(
    accountId,
    dateRange.startDate,
    dateRange.endDate,
  );

  if (!isLoading && !account) {
    throw notFound();
  }

  return (
    <BaseScreen
      isLoading={isLoading}
      title={account?.name ?? t('feature.accounts.details.title', 'Account')}
      actions={
        <Button
          variant="subtle"
          size="sm"
          onClick={() =>
            navigate({ to: '/accounts/$id/edit', params: { id: accountId } })
          }
        >
          {t('feature.accounts.details.editButton', 'Edit')}
        </Button>
      }
    >
      <Box maw={800} mx="auto">
        <Stack gap={spacing.md}>
          <AccountDetailsHeader accountId={accountId} />

          <DateRangeButton
            selectedRange={dateRange}
            onRangeSelected={(range) => {
              if (range) setDateRange(range);
            }}
          />

          <BalanceTrendChart
            balanceHistory={chartData?.balanceHistory ?? []}
            currency={account?.currency ?? ''}
            isLoading={isChartLoading}
          />

          <MonthlyInOutChart
            chart={chartData?.chart ?? []}
            currency={account?.currency ?? ''}
            isLoading={isChartLoading}
          />

          <TransactionsSection
            accountId={accountId}
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />

          {account?.source === 'synced' && (
            <OpenBankingCard accountId={accountId} />
          )}

          {account && <AccountPropertiesCard account={account} />}

          <DangerZone accountId={accountId} />
        </Stack>
      </Box>
    </BaseScreen>
  );
}
