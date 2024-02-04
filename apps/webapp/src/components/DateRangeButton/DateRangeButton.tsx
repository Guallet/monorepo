import {
  Button,
  Divider,
  Group,
  Popover,
  ScrollArea,
  Stack,
} from "@mantine/core";
import { DateListPicker, DateRangeSelectionItem } from "./DateListPicker";
import { CalendarDateRangePicker } from "./CalendarDateRangePicker";
import { useState } from "react";

interface Props {
  selectedRange: { startDate: Date; endDate: Date } | null;
  onRangeSelected: (range: { startDate: Date; endDate: Date } | null) => void;
}

export function DateRangeButton({ selectedRange, onRangeSelected }: Props) {
  const [range, setRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  } | null>(selectedRange ?? null);
  const [opened, setOpened] = useState<boolean>(false);
  const [listItemSelected, setListItemSelected] =
    useState<DateRangeSelectionItem | null>(null);
  const [buttonLabel, setButtonLabel] = useState<string>("Select range");

  return (
    <Popover
      position="bottom"
      withArrow
      shadow="md"
      opened={opened}
      onChange={setOpened}
    >
      <Popover.Target>
        <Button
          variant="outline"
          onClick={() => {
            setOpened(!opened);
          }}
        >
          {buttonLabel}
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack>
          <Group>
            <ScrollArea h={300}>
              <DateListPicker
                value={listItemSelected}
                onItemSelected={(selectedRange) => {
                  setListItemSelected(selectedRange);
                  setRange({
                    startDate: selectedRange.range.startDate,
                    endDate: selectedRange.range.endDate,
                  });
                }}
              />
            </ScrollArea>
            <Divider orientation="vertical" />
            <CalendarDateRangePicker
              startDate={range?.startDate ?? null}
              endDate={range?.endDate ?? null}
              onRangeChanged={(x) => {
                setListItemSelected(null);
                setRange({
                  startDate: x?.startDate ?? null,
                  endDate: x?.endDate ?? null,
                });
              }}
            />
          </Group>
          <Divider />
          <Group>
            <Button
              variant="outline"
              onClick={() => {
                setOpened(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                onRangeSelected({
                  startDate: range?.startDate ?? new Date(),
                  endDate: range?.endDate ?? new Date(),
                });

                setButtonLabel(
                  !range
                    ? "Select range"
                    : listItemSelected
                    ? listItemSelected.label
                    : "Custom range"
                );

                setOpened(false);
              }}
            >
              Apply
            </Button>
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
