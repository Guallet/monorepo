import {
  Button,
  List,
  Select,
  rem,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Container,
  Title,
  Paper,
  Group,
  Alert,
  Badge,
} from '@mantine/core';
import { FieldMappings } from '../models';
import { useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { csvFieldsAtom, csvInfoAtom, csvMappingsAtom } from '../state/csvState';
import { IconExclamationCircle, IconAlertCircle } from '@tabler/icons-react';
import { isDate } from '@/utils/dateUtils';
import { isValidNumber } from '@/utils/numberUtils';
import { CsvStepper } from '../components/CsvStepper';

const SAMPLE_ARRAY_SIZE = 10;
const EMPTY_MAP_FIELD_VALUE = "Don't map";

export function CsvPropertiesScreen() {
  const navigate = useNavigate();

  const csvData = useAtomValue(csvInfoAtom);
  const csvFields = useAtomValue(csvFieldsAtom);
  const availableFields = [EMPTY_MAP_FIELD_VALUE, ...csvFields];

  const [isValidDateField, setIsValidDateField] = useState(true);
  const [isValidAmountField, setIsValidAmountField] = useState(true);

  const sampleData = useMemo(() => {
    // Get random transactions to use them as sample rows
    // Fisher-Yates shuffle algorithm (deterministic with index)
    const arr = [...csvData.data];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor((i + 1) * 0.5); // Pseudo-random based on index
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, SAMPLE_ARRAY_SIZE);
  }, [csvData.data]);

  const [mappings, setMappings] = useAtom(csvMappingsAtom);

  const canContinue =
    mappings.date !== '' &&
    mappings.amount !== '' &&
    mappings.description !== '' &&
    isValidDateField &&
    isValidAmountField;

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={2}>Map CSV Fields</Title>
          <Text c="dimmed" size="sm">
            Match your CSV columns to transaction fields. Required fields are
            marked with *.
          </Text>
        </Stack>

        <CsvStepper
          activeStep={1}
          onStepClick={(stepIndex) => {
            if (stepIndex === 0) {
              navigate({
                to: '/importer/csv',
              });
            }
          }}
        />

        {(!isValidDateField || !isValidAmountField) && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Validation Issues"
            color="red"
          >
            <List
              icon={
                <ThemeIcon color="red" size={20} radius="xl">
                  <IconExclamationCircle
                    style={{ width: rem(12), height: rem(12) }}
                  />
                </ThemeIcon>
              }
            >
              {!isValidDateField && (
                <List.Item>
                  The selected DATE field doesn't follow a valid date pattern
                </List.Item>
              )}
              {!isValidAmountField && (
                <List.Item>The selected AMOUNT field is not a number</List.Item>
              )}
            </List>
          </Alert>
        )}

        <Paper shadow="sm" p="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={500}>Field Mappings</Text>
              <Badge color="blue">{csvData.data.length} transactions</Badge>
            </Group>

            <Table striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>
                    Account{' '}
                    <Text component="span" c="red">
                      *
                    </Text>
                  </Table.Th>
                  <Table.Th>
                    Date{' '}
                    <Text component="span" c="red">
                      *
                    </Text>
                  </Table.Th>
                  <Table.Th>
                    Amount{' '}
                    <Text component="span" c="red">
                      *
                    </Text>
                  </Table.Th>
                  <Table.Th>
                    Description{' '}
                    <Text component="span" c="red">
                      *
                    </Text>
                  </Table.Th>
                  <Table.Th>Notes</Table.Th>
                  <Table.Th>Category</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td>
                    <Select
                      placeholder="Select column"
                      data={availableFields}
                      value={mappings.account || EMPTY_MAP_FIELD_VALUE}
                      onChange={(value) => {
                        const fieldValue =
                          value === EMPTY_MAP_FIELD_VALUE ? '' : value;
                        setMappings({
                          ...mappings,
                          account: fieldValue ?? '',
                        });
                      }}
                      searchable
                      clearable
                    />
                  </Table.Td>
                  <Table.Td>
                    <Select
                      placeholder="Select column"
                      data={availableFields}
                      value={mappings.date || EMPTY_MAP_FIELD_VALUE}
                      onChange={(value) => {
                        const fieldValue =
                          value === EMPTY_MAP_FIELD_VALUE ? '' : value;
                        setMappings({
                          ...mappings,
                          date: fieldValue ?? '',
                        });

                        const testDates = sampleData.map(
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          (x: any) => x[fieldValue || ''],
                        );
                        const isValid =
                          fieldValue === '' ||
                          testDates.every((input) => isDate(input));
                        setIsValidDateField(isValid);
                      }}
                      searchable
                      error={!isValidDateField}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Select
                      placeholder="Select column"
                      data={availableFields}
                      value={mappings.amount || EMPTY_MAP_FIELD_VALUE}
                      onChange={(value) => {
                        const fieldValue =
                          value === EMPTY_MAP_FIELD_VALUE ? '' : value;
                        setMappings({
                          ...mappings,
                          amount: fieldValue ?? '',
                        });

                        const testAmounts = sampleData.map(
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          (x: any) => x[fieldValue || ''],
                        );
                        const isValid =
                          fieldValue === '' ||
                          testAmounts.every((input) => isValidNumber(input));
                        setIsValidAmountField(isValid);
                      }}
                      searchable
                      error={!isValidAmountField}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Select
                      placeholder="Select column"
                      data={availableFields}
                      value={mappings.description || EMPTY_MAP_FIELD_VALUE}
                      onChange={(value) => {
                        const fieldValue =
                          value === EMPTY_MAP_FIELD_VALUE ? '' : value;
                        setMappings({
                          ...mappings,
                          description: fieldValue ?? '',
                        });
                      }}
                      searchable
                      clearable
                    />
                  </Table.Td>
                  <Table.Td>
                    <Select
                      placeholder="Select column"
                      data={availableFields}
                      value={mappings.notes || EMPTY_MAP_FIELD_VALUE}
                      onChange={(value) => {
                        const fieldValue =
                          value === EMPTY_MAP_FIELD_VALUE ? '' : value;
                        setMappings({
                          ...mappings,
                          notes: fieldValue ?? '',
                        });
                      }}
                      searchable
                      clearable
                    />
                  </Table.Td>
                  <Table.Td>
                    <Select
                      placeholder="Select column"
                      data={availableFields}
                      value={mappings.category || EMPTY_MAP_FIELD_VALUE}
                      onChange={(value) => {
                        const fieldValue =
                          value === EMPTY_MAP_FIELD_VALUE ? '' : value;
                        setMappings({
                          ...mappings,
                          category: fieldValue ?? '',
                        });
                      }}
                      searchable
                      clearable
                    />
                  </Table.Td>
                </Table.Tr>
                {sampleData.map((x, index) => (
                  <RowElement key={index} mappings={mappings} element={x} />
                ))}
              </Table.Tbody>
            </Table>

            <Text size="xs" c="dimmed">
              Preview showing {Math.min(SAMPLE_ARRAY_SIZE, csvData.data.length)}{' '}
              of {csvData.data.length} transactions
            </Text>
          </Stack>
        </Paper>

        <Group justify="flex-end">
          <Button
            onClick={() => {
              navigate({
                to: '/importer/csv/accounts',
              });
            }}
            disabled={!canContinue}
          >
            Continue to Accounts
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}

interface RowElementProps {
  mappings: FieldMappings;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  element: any;
}
function RowElement({ mappings, element }: Readonly<RowElementProps>) {
  return (
    <Table.Tr>
      <Table.Td>{element[mappings.account] || '-'}</Table.Td>
      <Table.Td>{element[mappings.date] || '-'}</Table.Td>
      <Table.Td>{element[mappings.amount] || '-'}</Table.Td>
      <Table.Td>{element[mappings.description] || '-'}</Table.Td>
      <Table.Td>{element[mappings.notes] || '-'}</Table.Td>
      <Table.Td>{element[mappings.category] || '-'}</Table.Td>
    </Table.Tr>
  );
}
