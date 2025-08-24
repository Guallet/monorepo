import { useLocale } from "@/i18n/useLocale";
import { Button, Popover } from "@mantine/core";
import { MonthPicker } from "@mantine/dates";
import { useState } from "react";

interface MonthSelectorProps extends React.ComponentProps<typeof MonthPicker> {
  date: Date;
  onDateSelected: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

export function MonthSelector({
  date,
  onDateSelected,
  minDate,
  maxDate,
  ...props
}: Readonly<MonthSelectorProps>) {
  const [opened, setOpened] = useState(false);
  const { locale } = useLocale();

  return (
    <Popover
      position="bottom"
      withArrow
      shadow="md"
      opened={opened}
      onChange={setOpened}
    >
      <Popover.Target>
        <Button variant="outline" onClick={() => setOpened((o) => !o)}>
          {date.toLocaleDateString(locale, {
            month: "long",
            year: "numeric",
          })}
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <MonthPicker
          defaultDate={new Date()}
          minDate={minDate}
          type="default"
          maxDate={maxDate}
          value={date}
          onChange={(newValue) => {
            if (newValue && typeof newValue === "string") {
              onDateSelected(new Date(newValue));
              setOpened(false);
            } else {
              console.error("Invalid date selected", newValue);
            }
          }}
          {...props}
        />
      </Popover.Dropdown>
    </Popover>
  );
}
