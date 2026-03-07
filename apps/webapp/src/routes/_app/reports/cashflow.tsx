import { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ReportFilters } from '@/features/reports/components/ReportFilters';
import { CashflowDataDto } from '@/features/reports/CashFlow/cashflow.models';
import { CashFlowRow } from '@/features/reports/CashFlow/CashFlowCategoryRow';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { z } from 'zod';
import {
  useAccounts,
  useCategories,
  useCashflowReports,
} from '@guallet/api-react';
const pageSearchSchema = z.object({
  year: z.number().catch(new Date().getUTCFullYear()),
});

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const Route = createFileRoute('/_app/reports/cashflow')({
  component: CashFlowPage,
  validateSearch: pageSearchSchema,
});

export function CashFlowPage() {
  const { year } = Route.useSearch();
  const [selectedYear, setSelectedYear] = useState(year);

  useEffect(() => {
    setSelectedYear(year);
  }, [year]);

  const { accounts } = useAccounts();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { cashflowData, isLoading: reportLoading } = useCashflowReports({
    year: selectedYear,
  });

  const isLoading = categoriesLoading || reportLoading;

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Cash flow</h1>

      <ReportFilters
        accounts={accounts}
        categories={categories}
        onFiltersUpdate={(filters) => {
          console.log('Filters updated', filters);
        }}
      />

      <div className="max-w-xs space-y-2">
        <Label htmlFor="cashflow-year">Pick year</Label>
        <Input
          id="cashflow-year"
          type="number"
          placeholder="Pick a year to run the report"
          value={selectedYear}
          onChange={(event) => {
            const nextYear = event.currentTarget.valueAsNumber;
            if (!Number.isNaN(nextYear)) {
              setSelectedYear(nextYear);
            }
          }}
        />
      </div>

      {cashflowData && <CashFlowTable reportData={cashflowData} />}
    </div>
  );
}

interface CashFlowTableProps {
  reportData: CashflowDataDto;
}

function CashFlowTable({ reportData }: Readonly<CashFlowTableProps>) {
  const rows = reportData.data.map((row) => (
    <CashFlowRow key={row.categoryId} row={row} />
  ));

  const rootCategoriesData = reportData.data.filter((row) => row.isParent);
  const totalRow = (
    <tr key="totalRow" className="bg-muted font-semibold">
      <td className="px-3 py-2">Total</td>
      {MONTH_LABELS.map((_, index) => (
        <td key={`total-${index}`} className="px-3 py-2">
          {getArraySum(rootCategoriesData.map((row) => row.values[index]))}
        </td>
      ))}
    </tr>
  );

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="min-w-[820px] w-full border-collapse text-sm">
        <CashFlowHeadRow />
        <tbody>{[...rows, totalRow]}</tbody>
      </table>
    </div>
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
    <thead>
      <tr className="border-b bg-muted/60 text-left">
        <th className="px-3 py-2">Category</th>
        {MONTH_LABELS.map((label) => (
          <th key={label} className="px-3 py-2">
            {label}
          </th>
        ))}
      </tr>
    </thead>
  );
}
