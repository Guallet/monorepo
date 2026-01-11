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
  Stepper,
  Badge
} from '@mantine/core';
import { useNavigate, Navigate } from '@tanstack/react-router';
import { useAtomValue, useAtom } from 'jotai';
import { csvCategoriesAtom, categoriesMappingsAtom } from '../state/csvState';
import { useCategories } from '@guallet/api-react';

export function CsvCategoriesScreen() {
  const navigate = useNavigate();

  const { categories: remoteCategories } = useCategories();
  const csvCategories = useAtomValue(csvCategoriesAtom);
  const [mappings, setMappings] = useAtom(categoriesMappingsAtom);

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

        <Stepper active={3} size="sm">
          <Stepper.Step label="Upload" description="CSV file" />
          <Stepper.Step label="Map fields" description="Column mapping" />
          <Stepper.Step label="Accounts" description="Account mapping" />
          <Stepper.Step label="Categories" description="Category mapping" />
          <Stepper.Step label="Review" description="Final review" />
        </Stepper>

        <Paper shadow="sm" p="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={500}>Category Mappings</Text>
              <Badge color="blue">
                {csvCategories.length} {csvCategories.length === 1 ? 'category' : 'categories'}
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
                    <Table.Tr key={index}>
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
                            mappings[categoryName] = remoteCategories.find(
                              (x) => x.id === value,
                            );
                            setMappings({...mappings});
                          }}
                        />
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>

            <Text size="xs" c="dimmed">
              Tip: Leave categories untagged if you want to categorize them later
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
