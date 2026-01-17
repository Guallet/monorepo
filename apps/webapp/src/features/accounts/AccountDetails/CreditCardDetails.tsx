import { AccountDto } from '@guallet/api-client';
import { LineChart } from '@mantine/charts';
import { Text } from '@mantine/core';

interface Props {
  account: AccountDto;
}

interface ChardData {
  name: string;
  total: number;
  in: number;
  out: number;
}

const sampleData: ChardData[] = [
  {
    name: 'January',
    total: 4000,
    in: 2400,
    out: 2400,
  },
  {
    name: 'February',
    total: 3000,
    in: 1398,
    out: 2210,
  },
  {
    name: 'March',
    total: 2000,
    in: 9800,
    out: 2290,
  },
  {
    name: 'April',
    total: 2780,
    in: 3908,
    out: 2000,
  },
  {
    name: 'May',
    total: 1890,
    in: 4800,
    out: 2181,
  },
  {
    name: 'June',
    total: 2390,
    in: 3800,
    out: 2500,
  },
  {
    name: 'July',
    total: 3490,
    in: 4300,
    out: 2100,
  },
];

export function CreditCardDetails({ account }: Readonly<Props>) {
  const data: ChardData[] = sampleData;

  return (
    <>
      <Text size="lg" fw={500} mb="md">
        TODO: Sample chart data. Get real data from API
      </Text>
      <LineChart
        // w={500}
        h={300}
        data={data}
        tooltipAnimationDuration={100}
        unit={account.currency}
        // unit="£"
        withTooltip
        withLegend
        dataKey="name"
        series={[
          { name: 'total', color: 'indigo.6' },
          { name: 'in', color: 'blue.6' },
          { name: 'out', color: 'teal.6' },
        ]}
      />
    </>
  );
}
