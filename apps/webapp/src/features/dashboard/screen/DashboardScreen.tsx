import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TotalWealthWidget } from '@/features/dashboard/components/widgets/TotalWealthWidget';
import { useState } from 'react';
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
import {
  IconCalendar,
  IconCalendarStats,
  IconCalendarTime,
} from '@tabler/icons-react';

dayjs.extend(quarterOfYear);

type DateRangeValue = [string | null, string | null];

function getDefaultDateRange(): DateRangeValue {
  return [
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .slice(0, 10),
    new Date().toISOString().slice(0, 10),
  ];
}

function formatDateRangeLabel(range: DateRangeValue): string {
  const [startDate, endDate] = range;

  if (!startDate || !endDate) {
    return 'Select Date Range';
  }

  const start = dayjs(startDate);
  const end = dayjs(endDate);

  if (start.isSame(end, 'day')) {
    return start.format('DD MMM YYYY');
  }

  return `${start.format('DD MMM')} - ${end.format('DD MMM YYYY')}`;
}

export function DashboardScreen() {
  const [dateRange, setDateRange] = useState<DateRangeValue>(
    getDefaultDateRange(),
  );

  const [filterOpened, setFilterOpened] = useState(false);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => setFilterOpened((opened) => !opened)}
          >
            <IconCalendar className="h-4 w-4" />
            {formatDateRangeLabel(dateRange)}
          </Button>
        </div>

        {filterOpened ? (
          <DateFilter
            value={dateRange}
            onChange={setDateRange}
            onClose={() => {
              setFilterOpened(false);
            }}
          />
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <TotalWealthWidget />
        </div>
        <div>
          <TotalIncomeExpenditureWidget
            startDate={dateRange[0]}
            endDate={dateRange[1]}
          />
        </div>
        <div>
          <CurrentAccountsWidget />
        </div>
        <div>
          <SavingGoalsWidget />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div>
          <MonthlyInAndOutWidget
            startDate={dateRange[0]}
            endDate={dateRange[1]}
          />
        </div>
        <div>
          <BalanceTrendWidget startDate={dateRange[0]} endDate={dateRange[1]} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <ExpenditureByCategoryWidget
            startDate={dateRange[0]}
            endDate={dateRange[1]}
          />
        </div>
        <div>
          <BudgetsWidget />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div>
          <LastTransactionsWidget />
        </div>
        <div>
          <TransactionsInboxWidget />
        </div>
      </div>
    </div>
  );
}

interface DateFilterProps {
  value: DateRangeValue;
  onChange: (range: DateRangeValue) => void;
  onClose: () => void;
}

function DateFilter({ value, onChange, onClose }: Readonly<DateFilterProps>) {
  const today = dayjs();
  const presets: Array<{ label: string; value: DateRangeValue }> = [
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
  ];

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="dashboard-start-date">Start date</Label>
          <Input
            id="dashboard-start-date"
            type="date"
            value={value[0] ?? ''}
            onChange={(event) => {
              const nextValue = event.currentTarget.value || null;
              onChange([nextValue, value[1]]);
            }}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="dashboard-end-date">End date</Label>
          <Input
            id="dashboard-end-date"
            type="date"
            value={value[1] ?? ''}
            onChange={(event) => {
              const nextValue = event.currentTarget.value || null;
              onChange([value[0], nextValue]);
            }}
          />
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Quick ranges
        </p>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, index) => (
            <Button
              key={preset.label}
              type="button"
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => {
                onChange(preset.value);
              }}
            >
              {index < 2 ? (
                <IconCalendarTime className="h-3.5 w-3.5" />
              ) : (
                <IconCalendarStats className="h-3.5 w-3.5" />
              )}
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            onChange(getDefaultDateRange());
          }}
        >
          Reset
        </Button>
        <Button type="button" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}
