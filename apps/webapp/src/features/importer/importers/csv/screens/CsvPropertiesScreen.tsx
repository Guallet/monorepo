import {
  Button,
  List,
  NativeSelect,
  rem,
  Stack,
  Table,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { FieldMappings } from "../models";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { csvFieldsAtom, csvInfoAtom, csvMappingsAtom } from "../state/csvState";
import { IconExclamationCircle } from "@tabler/icons-react";
import { isDate } from "@/utils/dateUtils";

const SAMPLE_ARRAY_SIZE = 10;
const EMPTY_MAP_FIELD_VALUE = "Don't map";

export function CsvPropertiesScreen() {
  const navigate = useNavigate();

  const [csvData, setCsvData] = useAtom(csvInfoAtom);
  const csvFields = useAtomValue(csvFieldsAtom);
  const availableFields = [EMPTY_MAP_FIELD_VALUE, ...csvFields];

  const [isValidDateField, setIsValidDateField] = useState(true);
  const [isValidAmountField, setIsValidAmountField] = useState(true);

  const sampleData = csvData.data
    // const shuffle the array to get random items, not necessary the first N items
    .toSorted(() => 0.5 - Math.random())
    // Get just a few elements to show as "example" to the user
    .slice(0, SAMPLE_ARRAY_SIZE);
  // We don't know the Type in advance, so we need to regenerate it dynamically
  // .map((row: any) => {
  //   let rowData: any = {};
  //   csvFields.map((field) => (rowData[field] = row[field]));
  //   console.log("ROW", { original: row, mapped: rowData });
  //   return rowData;
  // });

  const [mappings, setMappings] = useAtom(csvMappingsAtom);
  return (
    <Stack align="center">
      <Text>Map the fields</Text>

      <List
        icon={
          <ThemeIcon color="red" size={24} radius="xl">
            <IconExclamationCircle
              style={{ width: rem(16), height: rem(16) }}
            />
          </ThemeIcon>
        }
      >
        {isValidDateField === false && (
          <List.Item>
            The selected DATE field does't follow a valid date pattern
          </List.Item>
        )}
        {isValidAmountField === false && (
          <List.Item>The selected AMOUNT field is not a number</List.Item>
        )}
      </List>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Account</Table.Th>
            <Table.Th>Date</Table.Th>
            <Table.Th>Amount</Table.Th>
            <Table.Th>Description</Table.Th>
            <Table.Th>Notes</Table.Th>
            <Table.Th>Category</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <Table.Tr>
            <Table.Td>
              <NativeSelect
                data={availableFields}
                onChange={(event) => {
                  let value = event.currentTarget.value;
                  if (value === EMPTY_MAP_FIELD_VALUE) {
                    // Ignore this mapping
                    value = "";
                  }

                  setMappings({
                    account: value ?? "",
                    date: mappings.date ?? "",
                    amount: mappings.amount ?? "",
                    description: mappings.description ?? "",
                    notes: mappings.notes ?? "",
                    category: mappings.category ?? "",
                  });
                }}
              />
            </Table.Td>
            <Table.Td>
              <NativeSelect
                data={availableFields}
                onChange={(event) => {
                  let value = event.currentTarget.value;
                  if (value === EMPTY_MAP_FIELD_VALUE) {
                    // Ignore this mapping
                    value = "";
                  }

                  setMappings({
                    account: mappings.account ?? "",
                    date: value ?? "",
                    amount: mappings.amount ?? "",
                    description: mappings.description ?? "",
                    notes: mappings.notes ?? "",
                    category: mappings.category ?? "",
                  });

                  // Check if the selected field is a valid date
                  const testDates = sampleData.map((x: any) => x[value]);
                  // Try to parse the dates
                  const isValidDateField =
                    value === "" || testDates.every((input) => isDate(input));
                  setIsValidDateField(isValidDateField);
                }}
              />
            </Table.Td>
            <Table.Td>
              <NativeSelect
                data={availableFields}
                onChange={(event) => {
                  let value = event.currentTarget.value;
                  if (value === EMPTY_MAP_FIELD_VALUE) {
                    // Ignore this mapping
                    value = "";
                  }

                  setMappings({
                    account: mappings.account ?? "",
                    date: mappings.date ?? "",
                    amount: value ?? "",
                    description: mappings.description ?? "",
                    notes: mappings.notes ?? "",
                    category: mappings.category ?? "",
                  });

                  // Check if the selected field is a valid date
                  const testAmounts = sampleData.map((x: any) => x[value]);
                  // Try to parse the dates
                  const isValidField =
                    value === "" ||
                    testAmounts.every((input) => isNaN(+input) === false);
                  setIsValidAmountField(isValidField);
                }}
              />
            </Table.Td>
            <Table.Td>
              <NativeSelect
                data={availableFields}
                onChange={(event) => {
                  let value = event.currentTarget.value;
                  if (value === EMPTY_MAP_FIELD_VALUE) {
                    // Ignore this mapping
                    value = "";
                  }

                  setMappings({
                    account: mappings.account ?? "",
                    date: mappings.date ?? "",
                    amount: mappings.amount ?? "",
                    description: value ?? "",
                    notes: mappings.notes ?? "",
                    category: mappings.category ?? "",
                  });
                }}
              />
            </Table.Td>
            <Table.Td>
              <NativeSelect
                data={availableFields}
                onChange={(event) => {
                  let value = event.currentTarget.value;
                  if (value === EMPTY_MAP_FIELD_VALUE) {
                    // Ignore this mapping
                    value = "";
                  }

                  setMappings({
                    account: mappings.account ?? "",
                    date: mappings.date ?? "",
                    amount: mappings.amount ?? "",
                    description: mappings.description ?? "",
                    notes: value ?? "",
                    category: mappings.category ?? "",
                  });
                }}
              />
            </Table.Td>
            <Table.Td>
              <NativeSelect
                data={availableFields}
                onChange={(event) => {
                  let value = event.currentTarget.value;
                  if (value === EMPTY_MAP_FIELD_VALUE) {
                    // Ignore this mapping
                    value = "";
                  }

                  setMappings({
                    account: mappings.account ?? "",
                    date: mappings.date ?? "",
                    amount: mappings.amount ?? "",
                    description: mappings.description ?? "",
                    notes: mappings.notes ?? "",
                    category: value ?? "",
                  });
                }}
              />
            </Table.Td>
          </Table.Tr>
          {sampleData.map((x, index) => {
            return <RowElement key={index} mappings={mappings} element={x} />;
          })}
        </Table.Tbody>
      </Table>

      <Button
        onClick={() => {
          navigate({
            to: "/importer/csv/accounts",
          });
        }}
      >
        Continue
      </Button>
    </Stack>
  );
}

interface RowElementProps {
  mappings: FieldMappings;
  element: any;
}
function RowElement({ mappings, element }: Readonly<RowElementProps>) {
  return (
    <Table.Tr key={element.name}>
      <Table.Td>{element[mappings.account]}</Table.Td>
      <Table.Td>{element[mappings.date]}</Table.Td>
      <Table.Td>{element[mappings.amount]}</Table.Td>
      <Table.Td>{element[mappings.description] ?? ""}</Table.Td>
      <Table.Td>{element[mappings.notes] ?? ""}</Table.Td>
      <Table.Td>{element[mappings.category] ?? ""}</Table.Td>
    </Table.Tr>
  );
}
