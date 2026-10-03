import { Money } from '@guallet/money';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';
import { Group, Table, Text } from '@mantine/core';
import { CategoryDataRowDto } from './cashflow.models';
import { useState } from 'react';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';

interface IProps {
  row: CategoryDataRowDto;
}

export function CashFlowRow({ row }: IProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const currency = useDefaultCurrency();
  const formatMoney = (value: string) =>
    Money.fromCurrencyCode({
      amount: Number(value),
      currencyCode: currency,
    }).format();

  const subCategoryRows = row.subcategories.map((subCategory) => {
    return (
      <Table.Tr
        key={row.categoryId}
        style={{
          fontWeight: 'normal',
        }}
      >
        <Table.Td>{subCategory.categoryName}</Table.Td>
        <Table.Td>{formatMoney(subCategory.values[0])}</Table.Td>
        <Table.Td>{formatMoney(subCategory.values[1])}</Table.Td>
        <Table.Td>{formatMoney(subCategory.values[2])}</Table.Td>
        <Table.Td>{formatMoney(subCategory.values[3])}</Table.Td>
        <Table.Td>{formatMoney(subCategory.values[4])}</Table.Td>
        <Table.Td>{formatMoney(subCategory.values[5])}</Table.Td>
        <Table.Td>{formatMoney(subCategory.values[6])}</Table.Td>
        <Table.Td>{formatMoney(subCategory.values[7])}</Table.Td>
        <Table.Td>{formatMoney(subCategory.values[8])}</Table.Td>
        <Table.Td>{formatMoney(subCategory.values[9])}</Table.Td>
        <Table.Td>{formatMoney(subCategory.values[10])}</Table.Td>
        <Table.Td>{formatMoney(subCategory.values[11])}</Table.Td>
      </Table.Tr>
    );
  });

  const parentRow = (
    <Table.Tr
      key={row.categoryId}
      style={{
        fontWeight: row.isParent ? 'bold' : 'normal',
      }}
      onClick={() => {
        setIsExpanded(!isExpanded);
      }}
    >
      <Table.Td>
        <Group>
          {isExpanded === false ? (
            <IconChevronDown size={15} />
          ) : (
            <IconChevronRight size={15} />
          )}

          <Text fw={700}>{row.categoryName}</Text>
        </Group>
      </Table.Td>
      <Table.Td>{formatMoney(row.values[0])}</Table.Td>
      <Table.Td>{formatMoney(row.values[1])}</Table.Td>
      <Table.Td>{formatMoney(row.values[2])}</Table.Td>
      <Table.Td>{formatMoney(row.values[3])}</Table.Td>
      <Table.Td>{formatMoney(row.values[4])}</Table.Td>
      <Table.Td>{formatMoney(row.values[5])}</Table.Td>
      <Table.Td>{formatMoney(row.values[6])}</Table.Td>
      <Table.Td>{formatMoney(row.values[7])}</Table.Td>
      <Table.Td>{formatMoney(row.values[8])}</Table.Td>
      <Table.Td>{formatMoney(row.values[9])}</Table.Td>
      <Table.Td>{formatMoney(row.values[10])}</Table.Td>
      <Table.Td>{formatMoney(row.values[11])}</Table.Td>
    </Table.Tr>
  );

  if (isExpanded) {
    return [parentRow, ...subCategoryRows];
  } else {
    return [parentRow];
  }
}
