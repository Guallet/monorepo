import { Card, ScrollArea, Stack, Table, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { StampDutyResult } from '../models/stampDuty';

interface StampDutyBandTableProps {
  result: StampDutyResult;
  currency: string;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function StampDutyBandTable({
  result,
  currency,
}: Readonly<StampDutyBandTableProps>) {
  const { t } = useTranslation();

  return (
    <Card withBorder shadow="sm" radius="lg" p="lg">
      <Stack gap="md">
        <Text fw={600}>
          {t('screens.tools.stampDuty.bandTable.title', 'Tax band breakdown')}
        </Text>

        <ScrollArea>
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>
                  {t('screens.tools.stampDuty.bandTable.band', 'Band')}
                </Table.Th>
                <Table.Th>
                  {t('screens.tools.stampDuty.bandTable.rate', 'Rate')}
                </Table.Th>
                <Table.Th>
                  {t(
                    'screens.tools.stampDuty.bandTable.taxableAmount',
                    'Taxable amount',
                  )}
                </Table.Th>
                <Table.Th>
                  {t('screens.tools.stampDuty.bandTable.taxDue', 'Tax due')}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {result.bands.map((band) => (
                <Table.Tr
                  key={band.label}
                  style={{ opacity: band.taxableAmount === 0 ? 0.45 : 1 }}
                >
                  <Table.Td>{band.label}</Table.Td>
                  <Table.Td>{band.rate}%</Table.Td>
                  <Table.Td>
                    {formatCurrency(band.taxableAmount, currency)}
                  </Table.Td>
                  <Table.Td>{formatCurrency(band.taxDue, currency)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
            <Table.Tfoot>
              <Table.Tr>
                <Table.Th>
                  {t('screens.tools.stampDuty.bandTable.total', 'Total')}
                </Table.Th>
                <Table.Th>{result.effectiveRate}%</Table.Th>
                <Table.Th>—</Table.Th>
                <Table.Th>{formatCurrency(result.totalDue, currency)}</Table.Th>
              </Table.Tr>
            </Table.Tfoot>
          </Table>
        </ScrollArea>
      </Stack>
    </Card>
  );
}
