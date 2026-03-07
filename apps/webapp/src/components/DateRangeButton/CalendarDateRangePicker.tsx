import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface IProps {
  startDate: Date | null;
  endDate: Date | null;
  onRangeChanged: (
    range: { startDate: Date | null; endDate: Date | null } | null,
  ) => void;
}

function formatDateForInput(date: Date | null): string {
  if (!date) {
    return '';
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string): Date | null {
  if (value.trim() === '') {
    return null;
  }

  const parsedDate = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

export function CalendarDateRangePicker({
  startDate,
  endDate,
  onRangeChanged,
}: Readonly<IProps>) {
  return (
    <div className="flex min-w-[280px] flex-col gap-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
        <div className="grid gap-1">
          <Label htmlFor="calendar-date-range-start">From</Label>
          <Input
            id="calendar-date-range-start"
            type="date"
            value={formatDateForInput(startDate)}
            onChange={(event) => {
              const nextStartDate = parseDateInput(event.target.value);

              onRangeChanged({
                startDate: nextStartDate,
                endDate,
              });
            }}
          />
        </div>

        <span className="pb-2 text-sm text-muted-foreground">to</span>

        <div className="grid gap-1">
          <Label htmlFor="calendar-date-range-end">To</Label>
          <Input
            id="calendar-date-range-end"
            type="date"
            value={formatDateForInput(endDate)}
            onChange={(event) => {
              const nextEndDate = parseDateInput(event.target.value);

              onRangeChanged({
                startDate,
                endDate: nextEndDate,
              });
            }}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Select quick ranges on the left or choose a custom interval.
      </p>
    </div>
  );
}
