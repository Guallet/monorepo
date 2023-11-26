import { Group, Table, Text } from "@mantine/core";
import { CategoryDataRowDto } from "../api/cashflow.models";
import { useState } from "react";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";

interface IProps {
  row: CategoryDataRowDto;
}

export function CashFlowRow({ row }: IProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  if (isExpanded) {
    return [parentRow, ...subCategoryRows];
  } else {
    return [parentRow];
  }
}
