import { Card, ScrollArea, Stack, Table, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { LoanPaymentRow } from '../models/loan';

interface LoanAmortizationTableProps {
  rows: LoanPaymentRow[];
  currency: string;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function LoanAmortizationTable({
  rows,
  currency,
}: Readonly<LoanAmortizationTableProps>) {
  const { t } = useTranslation();

  return (
    <Card withBorder shadow="sm" radius="lg" p="lg">
      <Stack gap="md">
        <Text fw={600}>
          {t('screens.tools.loan.amortization.title', 'Monthly schedule')}
        </Text>

        <ScrollArea>
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>
                  {t('screens.tools.loan.amortization.month', 'Month')}
                </Table.Th>
                <Table.Th>
                  {t('screens.tools.loan.amortization.payment', 'Payment')}
                </Table.Th>
                <Table.Th>
                  {t('screens.tools.loan.amortization.interest', 'Interest')}
                </Table.Th>
                <Table.Th>
                  {t('screens.tools.loan.amortization.principal', 'Principal')}
                </Table.Th>
                <Table.Th>
                  {t('screens.tools.loan.amortization.balance', 'Balance')}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((row) => (
                <Table.Tr key={row.monthNumber}>
                  <Table.Td>{row.monthNumber}</Table.Td>
                  <Table.Td>{formatCurrency(row.payment, currency)}</Table.Td>
                  <Table.Td>
                    {formatCurrency(row.interestPaid, currency)}
                  </Table.Td>
                  <Table.Td>
                    {formatCurrency(row.principalPaid, currency)}
                  </Table.Td>
                  <Table.Td>
                    {formatCurrency(row.remainingBalance, currency)}
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
