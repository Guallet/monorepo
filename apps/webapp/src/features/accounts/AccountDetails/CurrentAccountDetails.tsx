import { AccountChartData, AccountDto } from "@guallet/api-client";
import { useAccountCharts } from "@guallet/api-react";
import { Loader } from "@mantine/core";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  Line,
  ComposedChart,
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
    in: x.total_in,
    out: x.total_out,
  }));

  if (isLoading) {
    return <Loader />;
  }

  return (
    <ResponsiveContainer width="100%" height={500}>
      <ComposedChart
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
        <Line type="monotone" dataKey="total" stroke="#36454F" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
