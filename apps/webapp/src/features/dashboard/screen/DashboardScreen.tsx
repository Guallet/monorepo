import { TotalWealthWidget } from "@/features/dashboard/components/widgets/TotalWealthWidget";
import { Grid, Container, Popover, Button } from "@mantine/core";
import { useState } from "react";
import { DatePicker } from "@mantine/dates";
import dayjs from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import { MonthlyInAndOutWidget } from "../components/widgets/MonthlyInAndOutWidget";
import { TransactionsInboxWidget } from "../components/widgets/TransactionsInboxWidget";
import { BudgetsWidget } from "../components/widgets/BudgetsWidget";
dayjs.extend(quarterOfYear);

export function DashboardScreen() {
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .slice(0, 10),
    new Date().toISOString().slice(0, 10),
  ]);

  const [filterOpened, setFilterOpened] = useState(false);

  return (
    <Container>
      {/* Filter popup for date range */}
      <Popover
        position="bottom-start"
        withArrow
        shadow="md"
        trapFocus
        opened={filterOpened}
        onChange={setFilterOpened}
      >
        <Popover.Target>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterOpened((o) => !o)}
          >
            {(() => {
              if (dateRange[0] && dateRange[1]) {
                const start = dayjs(dateRange[0]);
                const end = dayjs(dateRange[1]);
                const now = dayjs();
                const firstOfMonth = now.startOf("month");
                const lastOfMonth = now.endOf("month");
                if (
                  start.isSame(firstOfMonth, "day") &&
                  end.isSame(lastOfMonth, "day")
                ) {
                  return now.format("MMMM YYYY");
                }
                return `from ${start.format("DD-MM-YYYY")} to ${end.format("DD-MM-YYYY")}`;
              }
              return "Filter by Date";
            })()}
          </Button>
        </Popover.Target>
        <Popover.Dropdown>
          <DateFilter
            onChange={(value) => {
              setDateRange(value);
              //   setFilterOpened(false);
            }}
          />
        </Popover.Dropdown>
      </Popover>
      <Grid mt="md">
        <Grid.Col span={{ base: 12, md: 3 }}>
          <TotalWealthWidget />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <MonthlyInAndOutWidget />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TransactionsInboxWidget />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 3 }}>
          <BudgetsWidget />
        </Grid.Col>
      </Grid>
    </Container>
  );
}

interface DatePickerProps {
  onChange: (range: [string | null, string | null]) => void;
}
function DateFilter({ onChange }: Readonly<DatePickerProps>) {
  const today = dayjs();

  return (
    <DatePicker
      type="range"
      onChange={onChange}
      presets={[
        {
          value: [today.format("YYYY-MM-DD"), today.format("YYYY-MM-DD")],
          label: "Today",
        },
        {
          value: [
            today.subtract(1, "day").format("YYYY-MM-DD"),
            today.subtract(1, "day").format("YYYY-MM-DD"),
          ],
          label: "Yesterday",
        },
        {
          value: [
            today.subtract(6, "day").format("YYYY-MM-DD"),
            today.format("YYYY-MM-DD"),
          ],
          label: "Last 7 days",
        },
        {
          value: [
            today.subtract(29, "day").format("YYYY-MM-DD"),
            today.format("YYYY-MM-DD"),
          ],
          label: "Last 30 days",
        },
        {
          value: [
            today.subtract(364, "day").format("YYYY-MM-DD"),
            today.format("YYYY-MM-DD"),
          ],
          label: "Last 365 days",
        },
        {
          value: [
            today.subtract(1, "month").startOf("month").format("YYYY-MM-DD"),
            today.subtract(1, "month").endOf("month").format("YYYY-MM-DD"),
          ],
          label: "Last month",
        },
        {
          value: [
            today.subtract(11, "month").startOf("month").format("YYYY-MM-DD"),
            today.endOf("month").format("YYYY-MM-DD"),
          ],
          label: "Last 12 months",
        },
        {
          value: [
            today.subtract(1, "year").startOf("year").format("YYYY-MM-DD"),
            today.subtract(1, "year").endOf("year").format("YYYY-MM-DD"),
          ],
          label: "Last year",
        },
        {
          value: [
            today.startOf("week").format("YYYY-MM-DD"),
            today.format("YYYY-MM-DD"),
          ],
          label: "Week to date",
        },
        {
          value: [
            today.startOf("month").format("YYYY-MM-DD"),
            today.format("YYYY-MM-DD"),
          ],
          label: "Month to date",
        },
        {
          value: [
            today.startOf("quarter").format("YYYY-MM-DD"),
            today.format("YYYY-MM-DD"),
          ],
          label: "Quarter to date",
        },
        {
          value: [
            today.startOf("year").format("YYYY-MM-DD"),
            today.format("YYYY-MM-DD"),
          ],
          label: "Year to date",
        },
      ]}
    />
  );
}
