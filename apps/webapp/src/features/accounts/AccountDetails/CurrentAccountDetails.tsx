import { Account } from "@/accounts/models/Account";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Props {
  account: Account;
}
const data = [
  {
    name: "January",
    total: 4000,
    in: 2400,
    out: 2400,
  },
  {
    name: "February",
    total: 3000,
    in: 1398,
    out: 2210,
  },
  {
    name: "March",
    total: 2000,
    in: 9800,
    out: 2290,
  },
  {
    name: "April",
    total: 2780,
    in: 3908,
    out: 2000,
  },
  {
    name: "May",
    total: 1890,
    in: 4800,
    out: 2181,
  },
  {
    name: "June",
    total: 2390,
    in: 3800,
    out: 2500,
  },
  {
    name: "July",
    total: 3490,
    in: 4300,
    out: 2100,
  },
];

export function CurrentAccountDetails({ account }: Props) {
  return (
    <ResponsiveContainer width="100%" height={500}>
      <LineChart
        width={500}
        height={300}
        data={data}
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
        <Line type="monotone" dataKey="total" stroke="#82ca9d" />
        <Line
          type="monotone"
          dataKey="in"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
        <Line dataKey="out" stroke="black" />
      </LineChart>
    </ResponsiveContainer>
  );
}
