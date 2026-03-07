import { useState } from 'react';
import { ResponsiveModal } from '@guallet/ui-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocale } from '@/i18n/useLocale';

interface MonthSelectorProps {
  date: Date;
  onDateSelected: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

function formatMonthInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');

  return `${year}-${month}`;
}

function parseMonthInputValue(value: string): Date | null {
  const [yearPart, monthPart] = value.split('-');
  const parsedYear = Number(yearPart);
  const parsedMonth = Number(monthPart);

  if (
    Number.isNaN(parsedYear) ||
    Number.isNaN(parsedMonth) ||
    parsedMonth < 1 ||
    parsedMonth > 12
  ) {
    return null;
  }

  return new Date(parsedYear, parsedMonth - 1, 1);
}

export function MonthSelector({
  date,
  onDateSelected,
  minDate,
  maxDate,
}: Readonly<MonthSelectorProps>) {
  const [opened, setOpened] = useState(false);
  const [draftMonth, setDraftMonth] = useState(formatMonthInputValue(date));
  const { locale } = useLocale();

  const openModal = () => {
    setDraftMonth(formatMonthInputValue(date));
    setOpened(true);
  };

  const applySelectedMonth = () => {
    const parsedMonth = parseMonthInputValue(draftMonth);

    if (parsedMonth) {
      onDateSelected(parsedMonth);
      setOpened(false);
    }
  };

  return (
    <>
      <Button type="button" variant="outline" onClick={openModal}>
        {date.toLocaleDateString(locale, {
          month: 'long',
          year: 'numeric',
        })}
      </Button>

      <ResponsiveModal
        opened={opened}
        onClose={() => {
          setOpened(false);
        }}
        title="Select month"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="month-selector-input">Month</Label>
            <Input
              id="month-selector-input"
              type="month"
              value={draftMonth}
              min={minDate ? formatMonthInputValue(minDate) : undefined}
              max={maxDate ? formatMonthInputValue(maxDate) : undefined}
              onChange={(event) => {
                setDraftMonth(event.target.value);
              }}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpened(false);
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={applySelectedMonth}>
              Apply
            </Button>
          </div>
        </div>
      </ResponsiveModal>
    </>
  );
}
