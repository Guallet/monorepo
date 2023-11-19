import { Stack, Table, Text, useMantineTheme } from "@mantine/core";
import { ReportFilters } from "../components/ReportFilters";
import { LoaderFunction, useLoaderData } from "react-router-dom";
import { Category } from "../../categories/models/Category";
import { Account } from "../../accounts/models/Account";
import { loadAccounts } from "../../accounts/api/accounts.api";
import { loadCategories } from "../../categories/api/categories.api";
import { YearPickerInput } from "@mantine/dates";
import { useState } from "react";

type LoaderData = {
  accounts: Account[];
  categories: Category[];
  tableData: CashFlowTableRowData[];
};

export const loader: LoaderFunction = async ({ params }) => {
  const { id } = params;

  const accounts = await loadAccounts();
  const categories = await loadCategories();

  return {
    accounts: accounts,
    categories: categories,
    tableData: [
      {
        category: "Income",
        isSubcategory: false,
        data: {
          January: 100,
          February: 200,
          March: 300,
          April: 400,
          May: 500,
          June: 600,
          July: 700,
          August: 800,
          September: 900,
          October: 1000,
          November: 1100,
          December: 1200,
        },
      },
      {
        category: "Salary",
        isSubcategory: true,
        data: {
          January: 100,
          February: 200,
          March: 300,
          April: 400,
          May: 500,
          June: 600,
          July: 700,
          August: 800,
          September: 900,
          October: 1000,
          November: 1100,
          December: 1200,
        },
      },
      {
        category: "Bonus",
        isSubcategory: true,
        data: {
          January: 100,
          February: 200,
          March: 300,
          April: 400,
          May: 500,
          June: 600,
          July: 700,
          August: 800,
          September: 900,
          October: 1000,
          November: 1100,
          December: 1200,
        },
      },
      {
        category: "Expenses",
        isSubcategory: false,
        data: {
          January: 100,
          February: 200,
          March: 300,
          April: 400,
          May: 500,
          June: 600,
          July: 700,
          August: 800,
          September: 900,
          October: 1000,
          November: 1100,
          December: 1200,
        },
      },
      {
        category: "Food",
        isSubcategory: false,
        data: {
          January: 100,
          February: 200,
          March: 300,
          April: 400,
          May: 500,
          June: 600,
          July: 700,
          August: 800,
          September: 900,
          October: 1000,
          November: 1100,
          December: 1200,
        },
      },
    ],
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
      <CashFlowTable data={tableData} />
    </Stack>
  );
}

interface CashFlowTableProps {
  data: CashFlowTableRowData[];
}

interface CashFlowTableRowData {
  category: string;
  isSubcategory: boolean;
  data: {
    January: number;
    February: number;
    March: number;
    April: number;
    May: number;
    June: number;
    July: number;
    August: number;
    September: number;
    October: number;
    November: number;
    December: number;
  };
}

function CashFlowTable({ data }: CashFlowTableProps) {
  const theme = useMantineTheme();

  const rows = data.map((row, index) => (
    <Table.Tr
      key={index}
      style={{
        fontWeight: row.isSubcategory ? "normal" : "bold",
        // backgroundColor: row.isSubcategory
        //   ? "transparent"
        //   : theme.colors.gray[0],
      }}
    >
      <Table.Td>{row.category}</Table.Td>
      <Table.Td>{row.data.January}</Table.Td>
      <Table.Td>{row.data.February}</Table.Td>
      <Table.Td>{row.data.March}</Table.Td>
      <Table.Td>{row.data.April}</Table.Td>
      <Table.Td>{row.data.May}</Table.Td>
      <Table.Td>{row.data.June}</Table.Td>
      <Table.Td>{row.data.July}</Table.Td>
      <Table.Td>{row.data.August}</Table.Td>
      <Table.Td>{row.data.September}</Table.Td>
      <Table.Td>{row.data.October}</Table.Td>
      <Table.Td>{row.data.November}</Table.Td>
      <Table.Td>{row.data.December}</Table.Td>
    </Table.Tr>
  ));

  const rootCategoriesData = data.filter((x) => !x.isSubcategory);
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
        {getArraySum(rootCategoriesData.map((x) => x.data.January))}
      </Table.Td>
      <Table.Td>
        {getArraySum(rootCategoriesData.map((x) => x.data.February))}
      </Table.Td>
      <Table.Td>
        {getArraySum(rootCategoriesData.map((x) => x.data.March))}
      </Table.Td>
      <Table.Td>
        {getArraySum(rootCategoriesData.map((x) => x.data.April))}
      </Table.Td>
      <Table.Td>
        {getArraySum(rootCategoriesData.map((x) => x.data.May))}
      </Table.Td>
      <Table.Td>
        {getArraySum(rootCategoriesData.map((x) => x.data.June))}
      </Table.Td>
      <Table.Td>
        {getArraySum(rootCategoriesData.map((x) => x.data.July))}
      </Table.Td>
      <Table.Td>
        {getArraySum(rootCategoriesData.map((x) => x.data.August))}
      </Table.Td>
      <Table.Td>
        {getArraySum(rootCategoriesData.map((x) => x.data.September))}
      </Table.Td>
      <Table.Td>
        {getArraySum(rootCategoriesData.map((x) => x.data.October))}
      </Table.Td>
      <Table.Td>
        {getArraySum(rootCategoriesData.map((x) => x.data.November))}
      </Table.Td>
      <Table.Td>
        {getArraySum(rootCategoriesData.map((x) => x.data.December))}
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

function getArraySum(array: number[]): number {
  let sum = 0;
  for (let i = 0; i < array.length; i++) {
    sum += array[i];
  }
  return sum;
}
