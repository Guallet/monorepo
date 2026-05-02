import { Group, Stack, Text, TextInput } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useTheme } from '@guallet/ui-react';

interface IProps {
  startDate: Date | null;
  endDate: Date | null;
  onRangeChanged: (
    range: { startDate: Date | null; endDate: Date | null } | null
  ) => void;
}

function toInputValue(d: Date | null): string {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function fromInputValue(s: string): Date | null {
  if (!s) return null;
  const [y, m, day] = s.split('-').map(Number);
  if (!y || !m || !day) return null;
  return new Date(y, m - 1, day);
}

export function CalendarDateRangePicker({
  startDate,
  endDate,
  onRangeChanged,
}: Readonly<IProps>) {
  const { spacing } = useTheme();

  return (
    <Stack gap={spacing.sm}>
      <Group gap={spacing.sm} align="center">
        <TextInput
          type="date"
          flex={1}
          value={toInputValue(startDate)}
          onChange={(e) =>
            onRangeChanged({
              startDate: fromInputValue(e.target.value),
              endDate,
            })
          }
          styles={{ input: { fontWeight: 500 } }}
        />
        <Text c="dimmed" fz="md" style={{ flexShrink: 0 }}>
          →
        </Text>
        <TextInput
          type="date"
          flex={1}
          value={toInputValue(endDate)}
          onChange={(e) =>
            onRangeChanged({
              startDate,
              endDate: fromInputValue(e.target.value),
            })
          }
          styles={{ input: { fontWeight: 500 } }}
        />
      </Group>

      <DatePicker
        type="range"
        allowSingleDateInRange
        value={[startDate ?? null, endDate ?? null]}
        onChange={(x) => {
          onRangeChanged({
            startDate: x[0] ? new Date(x[0]) : null,
            endDate: x[1] ? new Date(x[1]) : null,
          });
        }}
      />
    </Stack>
  );
}
