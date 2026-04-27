import { Card, ScrollArea, Stack, Table, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { SalaryResult } from '../models/salary';

interface SalaryBreakdownTableProps {
  result: SalaryResult;
  showTaxBands: boolean;
}

function fmtCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 2,
  }).format(value);
}

interface BreakdownRow {
  label: string;
  annual: number;
  monthly: number;
  weekly: number;
  bold?: boolean;
  dimmed?: boolean;
  negative?: boolean;
}

export function SalaryBreakdownTable({
  result,
  showTaxBands,
}: Readonly<SalaryBreakdownTableProps>) {
  const { t } = useTranslation();

  const rows: BreakdownRow[] = [];

  rows.push({
    label: t('screens.tools.salary.breakdown.gross', 'Gross income'),
    annual: result.grossAnnual,
    monthly: result.grossAnnual / 12,
    weekly: result.grossAnnual / 52,
    bold: true,
  });

  if (result.pensionDeduction > 0) {
    rows.push({
      label: t(
        'screens.tools.salary.breakdown.pension',
        'Pension contribution',
      ),
      annual: -result.pensionDeduction,
      monthly: -result.pensionDeduction / 12,
      weekly: -result.pensionDeduction / 52,
      negative: true,
    });
  }

  if (showTaxBands) {
    result.incomeTaxBands.forEach((band) => {
      rows.push({
        label: `  ${band.label}`,
        annual: -band.taxDue,
        monthly: -band.taxDue / 12,
        weekly: -band.taxDue / 52,
        negative: true,
        dimmed: true,
      });
    });
    rows.push({
      label: t('screens.tools.salary.breakdown.totalIncomeTax', 'Income tax'),
      annual: -result.totalIncomeTax,
      monthly: -result.totalIncomeTax / 12,
      weekly: -result.totalIncomeTax / 52,
      negative: true,
    });
  } else {
    rows.push({
      label: t('screens.tools.salary.breakdown.incomeTax', 'Income tax'),
      annual: -result.totalIncomeTax,
      monthly: -result.totalIncomeTax / 12,
      weekly: -result.totalIncomeTax / 52,
      negative: true,
    });
  }

  if (showTaxBands) {
    result.niBands.forEach((band) => {
      rows.push({
        label: `  NI ${band.label}`,
        annual: -band.taxDue,
        monthly: -band.taxDue / 12,
        weekly: -band.taxDue / 52,
        negative: true,
        dimmed: true,
      });
    });
  }
  rows.push({
    label: t(
      'screens.tools.salary.breakdown.nationalInsurance',
      'National Insurance',
    ),
    annual: -result.totalNI,
    monthly: -result.totalNI / 12,
    weekly: -result.totalNI / 52,
    negative: true,
  });

  if (result.studentLoanDeduction > 0) {
    rows.push({
      label: t('screens.tools.salary.breakdown.studentLoan', 'Student loan'),
      annual: -result.studentLoanDeduction,
      monthly: -result.studentLoanDeduction / 12,
      weekly: -result.studentLoanDeduction / 52,
      negative: true,
    });
  }

  rows.push({
    label: t('screens.tools.salary.breakdown.takeHome', 'Take-home pay'),
    annual: result.takeHomeAnnual,
    monthly: result.takeHomeMonthly,
    weekly: result.takeHomeWeekly,
    bold: true,
  });

  return (
    <Card withBorder shadow="sm" radius="lg" p="lg">
      <Stack gap="md">
        <Text fw={600}>
          {t('screens.tools.salary.breakdown.title', 'Pay breakdown')}
        </Text>
        <ScrollArea>
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>
                  {t('screens.tools.salary.breakdown.item', 'Item')}
                </Table.Th>
                <Table.Th>
                  {t('screens.tools.salary.breakdown.annual', 'Annual')}
                </Table.Th>
                <Table.Th>
                  {t('screens.tools.salary.breakdown.monthly', 'Monthly')}
                </Table.Th>
                <Table.Th>
                  {t('screens.tools.salary.breakdown.weekly', 'Weekly')}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((row) => (
                <Table.Tr key={row.label}>
                  <Table.Td>
                    <Text
                      fw={row.bold ? 700 : 400}
                      c={row.dimmed ? 'dimmed' : undefined}
                      size={row.dimmed ? 'sm' : undefined}
                    >
                      {row.label}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text
                      fw={row.bold ? 700 : 400}
                      c={row.negative ? 'red' : row.bold ? 'green' : undefined}
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {fmtCurrency(Math.abs(row.annual))}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text
                      fw={row.bold ? 700 : 400}
                      c={row.negative ? 'red' : row.bold ? 'green' : undefined}
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {fmtCurrency(Math.abs(row.monthly))}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text
                      fw={row.bold ? 700 : 400}
                      c={row.negative ? 'red' : row.bold ? 'green' : undefined}
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {fmtCurrency(Math.abs(row.weekly))}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Stack>
    </Card>
  );
}
