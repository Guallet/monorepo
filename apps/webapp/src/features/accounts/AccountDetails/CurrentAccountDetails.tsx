import { AppSection } from "@/components/Cards/AppSection";
import { AccountChartData, AccountDto } from "@guallet/api-client";
import { useAccountCharts } from "@guallet/api-react";
import { Center, Loader, Text } from "@mantine/core";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  BarChart,
} from "recharts";

function compareChartItems(a: AccountChartData, b: AccountChartData): number {
  const aDate = new Date(a.year, a.month, 1).getTime();
  const bDate = new Date(b.year, b.month, 1).getTime();
  return aDate - bDate;
}

interface Props {
  account: AccountDto;
}

export function CurrentAccountDetails({ account }: Readonly<Props>) {
  const { data, isLoading } = useAccountCharts(account.id);

  const chartData = data?.chart.sort(compareChartItems).map((x) => ({
    name: new Date(x.year, x.month, 1).toLocaleString("default", {
      month: "long",
    }),
    total: (x.total_in + x.total_out).toFixed(2),
    in: Math.abs(x.total_in),
    out: Math.abs(x.total_out),
  }));

  if (isLoading) {
    return <Loader />;
  }

  if (chartData?.length === 0) {
    return (
      <AppSection title="">
        <Center>
          <Text>
            No data available yet. Add some transactions to start seeing some
            insights
          </Text>
        </Center>
      </AppSection>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={500}>
      <BarChart
        width={500}
        height={300}
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="in" fill="#AFE1AF" />
        <Bar dataKey="out" fill="#FF2400" />
      </BarChart>
    </ResponsiveContainer>
  );
}
