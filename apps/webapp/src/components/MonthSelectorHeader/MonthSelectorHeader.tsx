import { ActionIcon, Group } from "@mantine/core";
import { MonthSelector } from "./MonthSelector";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useMemo } from "react";

interface MonthSelectorHeaderProps extends React.ComponentProps<typeof Group> {
  date: Date;
  onDateChanged: (date: Date) => void;
}

export function MonthSelectorHeader({
  date,
  onDateChanged,
  ...props
}: Readonly<MonthSelectorHeaderProps>) {
  const selectedDate = useMemo(() => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }, [date]);

  // TODO: Get this from the min transaction date from the user
  const minDate = useMemo(() => {
    return new Date("2000-01-01");
  }, []);

  const maxDate = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }, []);

  return (
    <Group justify="space-between" {...props}>
      <ActionIcon
        variant="outline"
        onClick={() => {
          const selectedMonth = selectedDate.getMonth();
          const selectedYear = selectedDate.getFullYear();
          const previousMonth = new Date(selectedYear, selectedMonth - 1, 1);
          onDateChanged(previousMonth);
        }}
        disabled={selectedDate <= minDate}
      >
        <IconChevronLeft />
      </ActionIcon>
      <MonthSelector
        date={selectedDate}
        onDateSelected={(date: Date) => {
          onDateChanged(date);
        }}
        minDate={minDate}
        maxDate={maxDate}
      />
      <ActionIcon
        variant="outline"
        onClick={() => {
          const selectedMonth = selectedDate.getMonth();
          const selectedYear = selectedDate.getFullYear();
          const nextMonth = new Date(selectedYear, selectedMonth + 1, 1);
          onDateChanged(nextMonth);
        }}
        disabled={selectedDate >= maxDate}
      >
        <IconChevronRight />
      </ActionIcon>
    </Group>
  );
}
