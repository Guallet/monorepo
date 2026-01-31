import {
  Stack,
  Table,
  Select,
  Button,
  Container,
  Title,
  Text,
  Paper,
  Group,
  Badge,
} from '@mantine/core';
import { useNavigate, Navigate } from '@tanstack/react-router';
import {
  useCategoriesMappings,
  useCsvCategories,
  useCsvActions,
} from '../state/csvState';
import { useCategories } from '@guallet/api-react';
import { CsvStepper } from '../components/CsvStepper';

export function CsvCategoriesScreen() {
  const navigate = useNavigate();

  const { categories: remoteCategories } = useCategories();
  const csvCategories = useCsvCategories();
  const mappings = useCategoriesMappings();
  const { setCategoriesMappings } = useCsvActions();

  // If there are no categories values, just skip this step as we don't need to map anything
  // They will be left as "untagged"
  if (csvCategories.length === 0) {
    return <Navigate to="/importer/csv/summary" />;
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={2}>Map Categories</Title>
          <Text c="dimmed" size="sm">
            Map your CSV categories to existing categories or leave untagged.
          </Text>
        </Stack>

        <CsvStepper
          size="sm"
          activeStep={3}
          onStepClick={(stepIndex) => {
            switch (stepIndex) {
              case 0:
                navigate({
                  to: '/importer/csv',
                });
                break;
              case 1:
                navigate({
                  to: '/importer/csv/properties',
                });
                break;
              case 2:
                navigate({
                  to: '/importer/csv/accounts',
                });
                break;
              default:
                break;
            }
          }}
        />

        <Paper shadow="sm" p="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={500}>Category Mappings</Text>
              <Badge color="blue">
                {csvCategories.length}{' '}
                {csvCategories.length === 1 ? 'category' : 'categories'}
              </Badge>
            </Group>

            <Table striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>CSV Category</Table.Th>
                  <Table.Th>Map to Category</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {csvCategories.map((categoryName: string, index: number) => {
                  return (
                    <Table.Tr key={categoryName + index}>
                      <Table.Td>
                        <Text fw={500}>{categoryName}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Select
                          searchable
                          clearable
                          placeholder="Leave untagged"
                          data={remoteCategories.map((x) => {
                            return { value: x.id, label: x.name };
                          })}
                          onChange={(value) => {
                            setCategoriesMappings({
                              ...mappings,
                              [categoryName]: remoteCategories.find(
                                (x) => x.id === value,
                              ),
                            });
                          }}
                        />
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>

            <Text size="xs" c="dimmed">
              Tip: Leave categories untagged if you want to categorize them
              later
            </Text>
          </Stack>
        </Paper>

        <Group justify="space-between">
          <Button
            variant="subtle"
            onClick={() => {
              navigate({
                to: '/importer/csv/accounts',
              });
            }}
          >
            Back
          </Button>
          <Button
            onClick={() => {
              navigate({
                to: '/importer/csv/summary',
              });
            }}
          >
            Continue to Review
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
