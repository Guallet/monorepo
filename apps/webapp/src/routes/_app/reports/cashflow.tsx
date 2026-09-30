import { Money } from '@guallet/money';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';
import { Stack, Table, Text, useMantineTheme } from '@mantine/core';
import { YearPickerInput } from '@mantine/dates';
import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ReportFilters } from '@/features/reports/components/ReportFilters';
import { CashflowDataDto } from '@/features/reports/CashFlow/cashflow.models';
import { CashFlowRow } from '@/features/reports/CashFlow/CashFlowCategoryRow';

import { z } from 'zod';
import {
  useAccounts,
  useCategories,
  useCashflowReports,
} from '@guallet/api-react';
const pageSearchSchema = z.object({
  year: z.number().catch(new Date().getUTCFullYear()),
});

export const Route = createFileRoute('/_app/reports/cashflow')({
  component: CashFlowPage,
  validateSearch: pageSearchSchema,
});

export function CashFlowPage() {
  const { year } = Route.useSearch();
  const [selectedYear, setSelectedYear] = useState<Date | null>(null);

  const { accounts } = useAccounts();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { cashflowData, isLoading: reportLoading } = useCashflowReports({
    year,
  });

  const isLoading = categoriesLoading || reportLoading;

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <Stack>
      <Text>Cash flow</Text>
      <ReportFilters
        accounts={accounts}
        selectedAccounts={[]}
        categories={categories}
        selectedCategories={[]}
        onFiltersUpdate={(x) => {
          console.log('Filters updated', x);
        }}
      />
      <YearPickerInput
        label="Pick year"
        placeholder="Pick a year to run the report"
        value={selectedYear}
        onChange={setSelectedYear}
      />
      {cashflowData && <CashFlowTable reportData={cashflowData} />}
    </Stack>
  );
}

interface CashFlowTableProps {
  reportData: CashflowDataDto;
}

function CashFlowTable({ reportData }: CashFlowTableProps) {
  const theme = useMantineTheme();
  const currency = useDefaultCurrency();

  const rows = reportData.data.map((row) => (
    <CashFlowRow key={row.categoryId} row={row} />
  ));

  const rootCategoriesData = reportData.data.filter((x) => x.isParent);
  const totalRow = (
    <Table.Tr
      key="totalRow"
      style={{
        fontWeight: 'bold',
        backgroundColor: theme.colors.gray[5],
        color: 'white',
      }}
    >
      <Table.Td>Total</Table.Td>
      <Table.Td>
        {getArraySum(
          rootCategoriesData.map((x) => x.values[0]),
          currency,
        )}
      </Table.Td>
      <Table.Td>
        {getArraySum(
          rootCategoriesData.map((x) => x.values[1]),
          currency,
        )}
      </Table.Td>
      <Table.Td>
        {getArraySum(
          rootCategoriesData.map((x) => x.values[2]),
          currency,
        )}
      </Table.Td>
      <Table.Td>
        {getArraySum(
          rootCategoriesData.map((x) => x.values[3]),
          currency,
        )}
      </Table.Td>
      <Table.Td>
        {getArraySum(
          rootCategoriesData.map((x) => x.values[4]),
          currency,
        )}
      </Table.Td>
      <Table.Td>
        {getArraySum(
          rootCategoriesData.map((x) => x.values[5]),
          currency,
        )}
      </Table.Td>
      <Table.Td>
        {getArraySum(
          rootCategoriesData.map((x) => x.values[6]),
          currency,
        )}
      </Table.Td>
      <Table.Td>
        {getArraySum(
          rootCategoriesData.map((x) => x.values[7]),
          currency,
        )}
      </Table.Td>
      <Table.Td>
        {getArraySum(
          rootCategoriesData.map((x) => x.values[8]),
          currency,
        )}
      </Table.Td>
      <Table.Td>
        {getArraySum(
          rootCategoriesData.map((x) => x.values[9]),
          currency,
        )}
      </Table.Td>
      <Table.Td>
        {getArraySum(
          rootCategoriesData.map((x) => x.values[10]),
          currency,
        )}
      </Table.Td>
      <Table.Td>
        {getArraySum(
          rootCategoriesData.map((x) => x.values[11]),
          currency,
        )}
      </Table.Td>
    </Table.Tr>
  );

  return (
    <Table.ScrollContainer minWidth={500}>
      <Table highlightOnHover withTableBorder withColumnBorders>
        <CashFlowHeadRow />
        <Table.Tbody>{[...rows, totalRow]}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}

function getArraySum(array: string[], currency: string): string {
  let sum = 0;
  for (let i = 0; i < array.length; i++) {
    sum += Number(array[i]);
  }
  return Money.fromCurrencyCode({
    amount: sum,
    currencyCode: currency,
  }).format();
}

function CashFlowHeadRow() {
  return (
    <Table.Thead>
      <Table.Tr>
        <Table.Th>Category</Table.Th>
        <Table.Th>Jan</Table.Th>
        <Table.Th>Feb</Table.Th>
        <Table.Th>Mar</Table.Th>
        <Table.Th>Apr</Table.Th>
        <Table.Th>May</Table.Th>
        <Table.Th>Jun</Table.Th>
        <Table.Th>Jul</Table.Th>
        <Table.Th>Aug</Table.Th>
        <Table.Th>Sep</Table.Th>
        <Table.Th>Oct</Table.Th>
        <Table.Th>Nov</Table.Th>
        <Table.Th>Dec</Table.Th>
      </Table.Tr>
    </Table.Thead>
  );
}
