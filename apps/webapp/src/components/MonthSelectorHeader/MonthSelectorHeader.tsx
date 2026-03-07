import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useMemo } from 'react';
import { MonthSelector } from './MonthSelector';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MonthSelectorHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  date: Date;
  onDateChanged: (date: Date) => void;
}

export function MonthSelectorHeader({
  date,
  onDateChanged,
  className,
  ...props
}: Readonly<MonthSelectorHeaderProps>) {
  const selectedDate = useMemo(() => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }, [date]);

  const minDate = useMemo(() => {
    return new Date('2000-01-01');
  }, []);

  const maxDate = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }, []);

  const currentMonthStart = useMemo(() => {
    return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  }, [selectedDate]);

  const minMonthStart = useMemo(() => {
    return new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  }, [minDate]);

  const maxMonthStart = useMemo(() => {
    return new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
  }, [maxDate]);

  const canGoToPreviousMonth = currentMonthStart > minMonthStart;
  const canGoToNextMonth = currentMonthStart < maxMonthStart;

  return (
    <div
      className={cn('flex items-center justify-between gap-3', className)}
      {...props}
    >
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => {
          const selectedMonth = selectedDate.getMonth();
          const selectedYear = selectedDate.getFullYear();
          const previousMonth = new Date(selectedYear, selectedMonth - 1, 1);
          onDateChanged(previousMonth);
        }}
        disabled={!canGoToPreviousMonth}
      >
        <IconChevronLeft className="h-4 w-4" />
      </Button>

      <MonthSelector
        date={selectedDate}
        onDateSelected={(date: Date) => {
          onDateChanged(date);
        }}
        minDate={minDate}
        maxDate={maxDate}
      />

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => {
          const selectedMonth = selectedDate.getMonth();
          const selectedYear = selectedDate.getFullYear();
          const nextMonth = new Date(selectedYear, selectedMonth + 1, 1);
          onDateChanged(nextMonth);
        }}
        disabled={!canGoToNextMonth}
      >
        <IconChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
