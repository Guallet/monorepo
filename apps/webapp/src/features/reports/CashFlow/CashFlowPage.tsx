import { Stack, Table, Text, useMantineTheme } from "@mantine/core";
import { ReportFilters } from "../components/ReportFilters";
import { LoaderFunction, useLoaderData } from "react-router-dom";
import { Category } from "../../categories/models/Category";
import { Account } from "../../accounts/models/Account";
import { loadAccounts } from "../../accounts/api/accounts.api";
import { loadCategories } from "../../categories/api/categories.api";
import { YearPickerInput } from "@mantine/dates";
import { useState } from "react";
import { getCashflowReportData } from "../api/reports.api";
import { CashflowDataDto } from "../api/cashflow.models";

type LoaderData = {
  accounts: Account[];
  categories: Category[];
  tableData: CashflowDataDto;
};

export const loader: LoaderFunction = async ({ params, request }) => {
  const { id } = params;
  const url = new URL(request.url);
  const year =
    Number(url.searchParams.get("year")) === 0
      ? new Date().getUTCFullYear()
      : Number(url.searchParams.get("year"));

  const accounts = await loadAccounts();
  const categories = await loadCategories();
  const reportData = await getCashflowReportData(year);

  return {
    accounts: accounts,
    categories: categories,
    tableData: reportData,
  } as LoaderData;
};

export function CashFlowPage() {
  const { accounts, categories, tableData } = useLoaderData() as LoaderData;

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

  const rows = reportData.data.map((row) => {
    const subCategoryRows = row.subcategories.map((subCategory) => {
      return (
        <Table.Tr
          key={row.categoryId}
          style={{
            fontWeight: "normal",
          }}
        >
          <Table.Td>{subCategory.categoryName}</Table.Td>
          <Table.Td>{subCategory.values[0]}</Table.Td>
          <Table.Td>{subCategory.values[1]}</Table.Td>
          <Table.Td>{subCategory.values[2]}</Table.Td>
          <Table.Td>{subCategory.values[3]}</Table.Td>
          <Table.Td>{subCategory.values[4]}</Table.Td>
          <Table.Td>{subCategory.values[5]}</Table.Td>
          <Table.Td>{subCategory.values[6]}</Table.Td>
          <Table.Td>{subCategory.values[7]}</Table.Td>
          <Table.Td>{subCategory.values[8]}</Table.Td>
          <Table.Td>{subCategory.values[9]}</Table.Td>
          <Table.Td>{subCategory.values[10]}</Table.Td>
          <Table.Td>{subCategory.values[11]}</Table.Td>
        </Table.Tr>
      );
    });

    const parentRow = (
      <Table.Tr
        key={row.categoryId}
        style={{
          fontWeight: row.isParent ? "bold" : "normal",
        }}
      >
        <Table.Td>{row.categoryName}</Table.Td>
        <Table.Td>{row.values[0]}</Table.Td>
        <Table.Td>{row.values[1]}</Table.Td>
        <Table.Td>{row.values[2]}</Table.Td>
        <Table.Td>{row.values[3]}</Table.Td>
        <Table.Td>{row.values[4]}</Table.Td>
        <Table.Td>{row.values[5]}</Table.Td>
        <Table.Td>{row.values[6]}</Table.Td>
        <Table.Td>{row.values[7]}</Table.Td>
        <Table.Td>{row.values[8]}</Table.Td>
        <Table.Td>{row.values[9]}</Table.Td>
        <Table.Td>{row.values[10]}</Table.Td>
        <Table.Td>{row.values[11]}</Table.Td>
      </Table.Tr>
    );

    return [parentRow, ...subCategoryRows];
  });

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
