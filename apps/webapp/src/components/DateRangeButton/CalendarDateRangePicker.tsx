import { Group, Stack, Text } from "@mantine/core";
import { DateInput, DatePicker } from "@mantine/dates";

interface IProps {
  startDate: Date | null;
  endDate: Date | null;
  onRangeChanged: (
    range: { startDate: Date | null; endDate: Date | null } | null
  ) => void;
}

export function CalendarDateRangePicker({
  startDate,
  endDate,
  onRangeChanged,
}: IProps) {
  return (
    <Stack>
      <Group>
        <DateInput
          value={startDate}
          // onChange={(x) => {
          //   onRangeChanged({
          //     startDate: x,
          //     endDate: endDate,
          //   });
          // }}
          disabled
          placeholder="From"
          valueFormat="DD MMM YYYY"
        />
        <Text>{"->"}</Text>
        <DateInput
          value={endDate}
          // onChange={(x) => {
          //   onRangeChanged({
          //     startDate: startDate,
          //     endDate: x,
          //   });
          // }}
          disabled
          placeholder="To"
          valueFormat="DD MMM YYYY"
        />
      </Group>

      <DatePicker
        type="range"
        allowSingleDateInRange
        value={[startDate ?? null, endDate ?? null]}
        onChange={(x) => {
          onRangeChanged({
            startDate: x[0],
            endDate: x[1],
          });
        }}
      />
    </Stack>
  );
}
