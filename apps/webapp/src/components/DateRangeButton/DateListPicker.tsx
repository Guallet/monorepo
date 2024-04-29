import { Stack, Text, useMantineTheme } from "@mantine/core";

export interface IProps {
  value: DateRangeSelectionItem | null;
  onItemSelected: (selected: DateRangeSelectionItem) => void;
}

export type RangeValue =
  | "today"
  | "yesterday"
  | "last-7-days"
  | "last-30-days"
  | "last-365-days"
  | "last-month"
  | "last-12-months"
  | "last-year"
  | "week-to-date"
  | "month-to-date"
  | "quarter-to-date"
  | "year-to-date";

export type DateRangeSelectionItem = {
  value: RangeValue;
  label: string;
  range: { startDate: Date; endDate: Date };
};

const today = new Date();
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);

const a7DaysAgo = new Date();
a7DaysAgo.setDate(today.getDate() - 7);

const a30DaysAgo = new Date();
a30DaysAgo.setDate(today.getDate() - 30);

const a365DaysAgo = new Date();
a365DaysAgo.setDate(today.getDate() - 365);

const currentQuarter = Math.floor(today.getMonth() / 3);

const options: DateRangeSelectionItem[] = [
  {
    value: "today",
    label: "Today",
    range: { startDate: today, endDate: today },
  },
  {
    value: "yesterday",
    label: "Yesterday",
    range: { startDate: yesterday, endDate: yesterday },
  },
  {
    value: "last-7-days",
    label: "Last 7 days",
    range: { startDate: a7DaysAgo, endDate: today },
  },
  {
    value: "last-30-days",
    label: "Last 30 days",
    range: { startDate: a30DaysAgo, endDate: today },
  },
  {
    value: "last-365-days",
    label: "Last 365 days",
    range: { startDate: a365DaysAgo, endDate: today },
  },
  {
    value: "last-month",
    label: "Last month",
    range: {
      startDate: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      endDate: new Date(today.getFullYear(), today.getMonth(), 0),
    },
  },
  {
    value: "last-12-months",
    label: "Last 12 months",
    range: {
      startDate: new Date(today.getFullYear(), today.getMonth() - 12, 1),
      endDate: new Date(today.getFullYear(), today.getMonth(), 0),
    },
  },
  {
    value: "last-year",
    label: "Last year",
    range: {
      startDate: new Date(today.getFullYear() - 1, 1, 1),
      endDate: new Date(today.getFullYear() - 1, 11, 31),
    },
  },
  {
    value: "week-to-date",
    label: "Week to date",
    range: {
      startDate: getMonday(today),
      endDate: today,
    },
  },
  {
    value: "month-to-date",
    label: "Month to date",
    range: {
      startDate: new Date(today.getFullYear(), today.getMonth(), 1),
      endDate: today,
    },
  },
  {
    value: "quarter-to-date",
    label: "Quarter to date",
    range: {
      startDate: new Date(today.getFullYear(), currentQuarter * 3, 1),
      endDate: today,
    },
  },
  {
    value: "year-to-date",
    label: "Year to date",
    range: {
      startDate: new Date(today.getFullYear(), 0, 1),
      endDate: today,
    },
  },
];

function getMonday(d: Date): Date {
  const dt = new Date(d);
  const day = dt.getDay();
  const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(dt.setDate(diff));
}

export function DateListPicker({ value, onItemSelected }: IProps) {
  const theme = useMantineTheme();

  return (
    <Stack>
      {options.map((option) => (
        <Text
          key={option.value}
          onClick={() => {
            onItemSelected(option);
          }}
          style={{
            backgroundColor:
              value?.value === option.value ? theme.primaryColor : "",
          }}
        >
          {option.label}
        </Text>
      ))}
    </Stack>
  );
}
