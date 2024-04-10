import { AccountDto } from "@guallet/api-client";
import {
  LineChart,
  ChartTooltip,
  getFilteredChartTooltipPayload,
} from "@mantine/charts";

interface Props {
  account: AccountDto;
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

interface CustomChartTooltipProps {
  label: string;
  payload: Record<string, any>[] | undefined;
}

function CustomChartTooltip({ label, payload }: CustomChartTooltipProps) {
  if (!payload) return null;

  const curatedPayload = getFilteredChartTooltipPayload(
    payload as Record<string, any>[]
  ).map((item: Record<string, any>) => {
    const mapedItem: Record<string, any> = {
      ...item,
      payload: {
        ...item.payload,
        [item.name]:
          typeof item.value === "number" ? `£${item.value}` : item.value,
      },
    };
    return mapedItem;
  });

  console.log("payload", { payload, curatedPayload });

  return (
    <ChartTooltip label={label} payload={curatedPayload} />
    // <Paper px="md" py="sm" withBorder shadow="md" radius="md">
    //   <Text fw={500} mb={5}>
    //     {label}
    //   </Text>
    //   {getFilteredChartTooltipPayload(payload).map((item: any) => (
    //     <Text key={item.name} c={item.color} fz="sm">
    //       {item.name}: {item.value}
    //     </Text>
    //   ))}
    // </Paper>
  );
}

export function CreditCardDetails({ account }: Props) {
  return (
    <LineChart
      // w={500}
      h={300}
      data={data}
      tooltipAnimationDuration={100}
      unit={account.currency}
      // unit="£"
      withTooltip
      // tooltipProps={{
      //   labelFormatter: (label) => <Text>this is the label node</Text>,
      //   content: ({ label, payload }) => {
      //     return <ChartTooltip label={label} payload={payload} />;
      //     // return <CustomChartTooltip label={label} payload={payload} />;
      //   },
      // }}
      // tooltipProps={{
      //   // formatter: ({ label }) => {
      //   //   console.log("formatter", label);
      //   //   return "Formatter: " + label;
      //   // },
      //   // labelFormatter: ({ label }) => {
      //   //   console.log("labelFormatter", label);
      //   //   return "labelFormatter: " + label;
      //   // },
      //   // label: ({ label }) => {
      //   //   console.log("label", label);
      //   //   return "label: " + label;
      //   // },
      //   content: ({ label, payload }) => (
      //     // <ChartTooltip label={label} payload={payload} />
      //     <Paper>
      //       <Stack>
      //         <Text>{label}</Text>
      //         {/* <Text>{payload}</Text> */}
      //         {payload.map((item: any) => (
      //           <Text key={item.name} c={item.color} fz="sm">
      //             {item.name}: {item.value}
      //           </Text>
      //         ))}
      //       </Stack>
      //     </Paper>
      //   ),
      // }}

      withLegend
      dataKey="name"
      series={[
        { name: "total", color: "indigo.6" },
        { name: "in", color: "blue.6" },
        { name: "out", color: "teal.6" },
      ]}
    ></LineChart>
  );
}
