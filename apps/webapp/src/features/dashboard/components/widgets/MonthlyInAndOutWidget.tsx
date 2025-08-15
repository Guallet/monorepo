import { WidgetCard } from "./WidgetCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Box, Text } from "@mantine/core";

const data = [
  { month: "01 MAR", income: 7000, spending: 4000 },
  { month: "01 APR", income: 8000, spending: 3000 },
  { month: "01 MAY", income: 3000, spending: 6000 },
  { month: "01 JUN", income: 2000, spending: 5000 },
  { month: "01 JUL", income: 6000, spending: 4000 },
  { month: "01 AUG", income: 0, spending: 2000 },
];

export function MonthlyInAndOutWidget() {
  return (
    <WidgetCard title="Income vs. Spending">
      <Box
        style={{
          background: "#f8f9fa",
          borderRadius: 16,
          padding: 16,
          marginTop: 8,
        }}
      >
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis
              domain={[0, 8000]}
              ticks={[0, 2000, 4000, 6000, 8000]}
              tickFormatter={(v) => `£${v / 1000}K`}
            />
            <Tooltip
              formatter={(value: number) => `£${value.toLocaleString()}`}
            />
            <Legend
              verticalAlign="top"
              align="center"
              iconType="rect"
              wrapperStyle={{ marginBottom: 12 }}
              payload={[
                { value: "Incoming", type: "rect", color: "#12b886" },
                { value: "Outgoing", type: "rect", color: "#fd7e14" },
              ]}
            />
            <Bar
              dataKey="income"
              name="Incoming"
              fill="#12b886"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="spending"
              name="Outgoing"
              fill="#fd7e14"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <Text size="xs" color="dimmed" mt={8}>
          Income is teal, spending is orange.
        </Text>
      </Box>
    </WidgetCard>
  );
}
