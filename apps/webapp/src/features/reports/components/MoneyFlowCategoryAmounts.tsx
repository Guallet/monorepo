import { Accordion, Table, type AccordionProps } from '@mantine/core';
import { useTheme } from '@guallet/ui-react';
import { useTranslation } from 'react-i18next';
import type { MoneyFlowAmounts } from '@/features/reports/models/moneyFlow';

interface Props<Multiple extends boolean> extends AccordionProps<Multiple> {
  categories: MoneyFlowAmounts['categories'];
  formatAmount: (amount: bigint) => string;
}

export function MoneyFlowCategoryAmounts<Multiple extends boolean = false>({
  categories,
  formatAmount,
  ...props
}: Readonly<Props<Multiple>>) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const sortedCategories = [...categories].sort((a, b) =>
    a.fullName.localeCompare(b.fullName),
  );

  return (
    <Accordion<Multiple> variant="contained" radius="md" {...props}>
      <Accordion.Item value="category-amounts">
        <Accordion.Control>
          {t('screens.reports.moneyFlow.viewAmounts', 'View category amounts')}
        </Accordion.Control>
        <Accordion.Panel>
          <Table style={{ fontVariantNumeric: 'tabular-nums' }}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>
                  {t('screens.reports.moneyFlow.category', 'Category')}
                </Table.Th>
                <Table.Th ta="right">
                  {t('screens.reports.moneyFlow.moneyIn', 'Money in')}
                </Table.Th>
                <Table.Th ta="right">
                  {t('screens.reports.moneyFlow.moneyOut', 'Money out')}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sortedCategories.map((category) => (
                <Table.Tr key={category.id ?? 'uncategorised'}>
                  <Table.Th scope="row">{category.fullName}</Table.Th>
                  <Table.Td
                    ta="right"
                    c={category.moneyIn ? colors.support.dark : undefined}
                  >
                    {formatAmount(category.moneyIn)}
                  </Table.Td>
                  <Table.Td
                    ta="right"
                    c={category.moneyOut ? colors.status.error : undefined}
                  >
                    {formatAmount(-category.moneyOut)}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
