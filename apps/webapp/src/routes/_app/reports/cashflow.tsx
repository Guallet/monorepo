import { Stack, Table, Text, useMantineTheme } from "@mantine/core";
import { YearPickerInput } from "@mantine/dates";
import { useState } from "react";
import { FileRoute } from "@tanstack/react-router";
import { loadAccounts } from "@/features/accounts/api/accounts.api";
import { loadCategories } from "@/features/categories/api/categories.api";
import { getCashflowReportData } from "@/features/reports/api/reports.api";
import { ReportFilters } from "@/features/reports/components/ReportFilters";
import { CashflowDataDto } from "@/features/reports/api/cashflow.models";
import { CashFlowRow } from "@/features/reports/CashFlow/CashFlowCategoryRow";

import { z } from "zod";
const pageSearchSchema = z.object({
  year: z.number().catch(new Date().getUTCFullYear()),
});

export const Route = new FileRoute("/_app/reports/cashflow").createRoute({
  component: CashFlowPage,
  validateSearch: pageSearchSchema,
  loaderDeps: ({ search: { year } }) => ({ year }),
  loader: async ({ deps: { year } }) => loader({ year }),
});

async function loader(args: { year: number }) {
  const { year } = args;
  const accounts = await loadAccounts();
  const categories = await loadCategories();
  const reportData = await getCashflowReportData(year);

  return {
    accounts: accounts,
    categories: categories,
    tableData: reportData,
  };
}

export function CashFlowPage() {
  const { accounts, categories, tableData } = Route.useLoaderData();
  const [selectedYear, setSelectedYear] = useState<Date | null>(null);

  return (
    <Stack>
      <Text>Cash flow</Text>
      <ReportFilters
        accounts={accounts}
        selectedAccounts={[]}
        categories={categories}
        selectedCategories={[]}
        onFiltersUpdate={(x) => {
          console.log("Filters updated", x);
        }}
      />
      <YearPickerInput
        label="Pick year"
        placeholder="Pick a year to run the report"
        value={selectedYear}
        onChange={setSelectedYear}
      />
      <CashFlowTable reportData={tableData} />
    </Stack>
  );
}

interface CashFlowTableProps {
  reportData: CashflowDataDto;
}

function CashFlowTable({ reportData }: CashFlowTableProps) {
  const theme = useMantineTheme();

  const rows = reportData.data.map((row) => <CashFlowRow row={row} />);

  const rootCategoriesData = reportData.data.filter((x) => x.isParent);
  const totalRow = (
    <Table.Tr
      key="totalRow"
      style={{
        fontWeight: "bold",
        backgroundColor: theme.colors.gray[5],
        color: "white",
      }}
    >
      <Table.Td>Total</Table.Td>
      <Table.Td>
        {getArraySum(rootCategoriesData.map((x) => x.values[0]))}
      </Table.Td>
      <Table.Td>
        {getArraySum(rootCategoriesData.map((x) => x.values[1]))}
      </Table.Td>
      <Table.Td>
        {getArraySum(rootCategoriesData.map((x) => x.values[2]))}
      </Table.Td>
      <Table.Td>
        {getArraySum(rootCategoriesData.map((x) => x.values[3]))}
      </Table.Td>
      <Table.Td>
        {getArraySum(rootCategoriesData.map((x) => x.values[4]))}
      </Table.Td>
      <Table.Td>
        {getArraySum(rootCategoriesData.map((x) => x.values[5]))}
      </Table.Td>
      <Table.Td>
        {getArraySum(rootCategoriesData.map((x) => x.values[6]))}
      </Table.Td>
      <Table.Td>
        {getArraySum(rootCategoriesData.map((x) => x.values[7]))}
      </Table.Td>
      <Table.Td>
        {getArraySum(rootCategoriesData.map((x) => x.values[8]))}
      </Table.Td>
      <Table.Td>
        {getArraySum(rootCategoriesData.map((x) => x.values[9]))}
      </Table.Td>
      <Table.Td>
        {getArraySum(rootCategoriesData.map((x) => x.values[10]))}
      </Table.Td>
      <Table.Td>
        {getArraySum(rootCategoriesData.map((x) => x.values[11]))}
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

function getArraySum(array: string[]): string {
  let sum = 0;
  for (let i = 0; i < array.length; i++) {
    sum += Number(array[i]);
  }
  return sum.toFixed(2);
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
