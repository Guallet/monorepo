import { TotalWealthWidget } from '@/features/dashboard/components/widgets/TotalWealthWidget';
import {
  Grid,
  Container,
  Popover,
  Button,
  Title,
  Group,
  Box,
} from '@mantine/core';
import { useState } from 'react';
import { DatePicker } from '@mantine/dates';
import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import { MonthlyInAndOutWidget } from '../components/widgets/MonthlyInAndOutWidget';
import { TransactionsInboxWidget } from '../components/widgets/TransactionsInboxWidget';
import { BudgetsWidget } from '../components/widgets/BudgetsWidget';
import { TotalIncomeExpenditureWidget } from '../components/widgets/TotalIncomeExpenditureWidget';
import { CurrentAccountsWidget } from '../components/widgets/CurrentAccountsWidget';
import { SavingGoalsWidget } from '../components/widgets/SavingGoalsWidget';
import { ExpenditureByCategoryWidget } from '../components/widgets/ExpenditureByCategoryWidget';
import { LastTransactionsWidget } from '../components/widgets/LastTransactionsWidget';
import { BalanceTrendWidget } from '../components/widgets/BalanceTrendWidget';
import { RecurringPaymentsWidget } from '../components/widgets/RecurringPaymentsWidget';
import { NotificationsWidget } from '../components/widgets/NotificationsWidget';
import { IconCalendar } from '@tabler/icons-react';

dayjs.extend(quarterOfYear);

export function DashboardScreen() {
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .slice(0, 10),
    new Date().toISOString().slice(0, 10),
  ]);

  const [filterOpened, setFilterOpened] = useState(false);

  return (
    <Container size="xl" py="xl">
      <Box mb="xl">
        <Group justify="space-between" align="center">
          <Title order={2}>Dashboard</Title>
          <Popover
            position="bottom-end"
            withArrow
            shadow="md"
            trapFocus
            opened={filterOpened}
            onChange={setFilterOpened}
          >
            <Popover.Target>
              <Button
                variant="light"
                leftSection={<IconCalendar size={18} />}
                onClick={() => setFilterOpened((o) => !o)}
              >
                {(() => {
                  if (dateRange[0] && dateRange[1]) {
                    const start = dayjs(dateRange[0]);
                    const end = dayjs(dateRange[1]);
                    const now = dayjs();
                    const firstOfMonth = now.startOf('month');
                    const lastOfMonth = now.endOf('month');
                    if (
                      start.isSame(firstOfMonth, 'day') &&
                      end.isSame(lastOfMonth, 'day')
                    ) {
                      return now.format('MMMM YYYY');
                    }
                    return `${start.format('DD MMM')} - ${end.format('DD MMM YYYY')}`;
                  }
                  return 'Select Date Range';
                })()}
              </Button>
            </Popover.Target>
            <Popover.Dropdown>
              <DateFilter
                onChange={(value) => {
                  setDateRange(value);
                }}
              />
            </Popover.Dropdown>
          </Popover>
        </Group>
      </Box>

      <Grid gap="lg">
        {/* Row 1: Key metrics */}
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <TotalWealthWidget />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <TotalIncomeExpenditureWidget
            startDate={dateRange[0]}
            endDate={dateRange[1]}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <RecurringPaymentsWidget />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <CurrentAccountsWidget />
        </Grid.Col>

        {/* Row 2: Charts */}
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <MonthlyInAndOutWidget
            startDate={dateRange[0]}
            endDate={dateRange[1]}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <BalanceTrendWidget startDate={dateRange[0]} endDate={dateRange[1]} />
        </Grid.Col>

        {/* Row 3: Categories and Budgets */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <ExpenditureByCategoryWidget
            startDate={dateRange[0]}
            endDate={dateRange[1]}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <BudgetsWidget />
        </Grid.Col>

        {/* Row 4: Goals and Notifications */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <SavingGoalsWidget />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <NotificationsWidget />
        </Grid.Col>

        {/* Row 5: Transactions */}
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <LastTransactionsWidget />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <TransactionsInboxWidget />
        </Grid.Col>
      </Grid>
    </Container>
  );
}

interface DatePickerProps {
  onChange: (range: [string | null, string | null]) => void;
}
function DateFilter({ onChange }: Readonly<DatePickerProps>) {
  const today = dayjs();

  return (
    <DatePicker
      type="range"
      onChange={onChange}
      presets={[
        {
          value: [today.format('YYYY-MM-DD'), today.format('YYYY-MM-DD')],
          label: 'Today',
        },
        {
          value: [
            today.subtract(1, 'day').format('YYYY-MM-DD'),
            today.subtract(1, 'day').format('YYYY-MM-DD'),
          ],
          label: 'Yesterday',
        },
        {
          value: [
            today.subtract(6, 'day').format('YYYY-MM-DD'),
            today.format('YYYY-MM-DD'),
          ],
          label: 'Last 7 days',
        },
        {
          value: [
            today.subtract(29, 'day').format('YYYY-MM-DD'),
            today.format('YYYY-MM-DD'),
          ],
          label: 'Last 30 days',
        },
        {
          value: [
            today.subtract(364, 'day').format('YYYY-MM-DD'),
            today.format('YYYY-MM-DD'),
          ],
          label: 'Last 365 days',
        },
        {
          value: [
            today.subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
            today.subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
          ],
          label: 'Last month',
        },
        {
          value: [
            today.subtract(11, 'month').startOf('month').format('YYYY-MM-DD'),
            today.endOf('month').format('YYYY-MM-DD'),
          ],
          label: 'Last 12 months',
        },
        {
          value: [
            today.subtract(1, 'year').startOf('year').format('YYYY-MM-DD'),
            today.subtract(1, 'year').endOf('year').format('YYYY-MM-DD'),
          ],
          label: 'Last year',
        },
        {
          value: [
            today.startOf('week').format('YYYY-MM-DD'),
            today.format('YYYY-MM-DD'),
          ],
          label: 'Week to date',
        },
        {
          value: [
            today.startOf('month').format('YYYY-MM-DD'),
            today.format('YYYY-MM-DD'),
          ],
          label: 'Month to date',
        },
        {
          value: [
            today.startOf('quarter').format('YYYY-MM-DD'),
            today.format('YYYY-MM-DD'),
          ],
          label: 'Quarter to date',
        },
        {
          value: [
            today.startOf('year').format('YYYY-MM-DD'),
            today.format('YYYY-MM-DD'),
          ],
          label: 'Year to date',
        },
      ]}
    />
  );
}
