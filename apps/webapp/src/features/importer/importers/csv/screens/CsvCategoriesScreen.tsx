import { Stack, Table, Select, Button } from "@mantine/core";
import { useNavigate, Navigate } from "@tanstack/react-router";
import { useAtomValue, useAtom } from "jotai";
import { csvCategoriesAtom, categoriesMappingsAtom } from "../state/csvState";
import { useCategories } from "@guallet/api-react";

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
    <Stack>
      <p>Categories</p>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Imported Categories</Table.Th>
            <Table.Th>Destination Categories</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {csvCategories.map((categoryName: string, index: number) => {
            return (
              <Table.Tr key={index}>
                <Table.Td>{categoryName}</Table.Td>
                <Table.Td>
                  {
                    <Select
                      placeholder="Untagged"
                      // data={remoteCategories.map((x) => x.name)}
                      data={remoteCategories.map((x) => {
                        return { value: x.id, label: x.name };
                      })}
                      onChange={(value) => {
                        // Map account X to value
                        mappings[categoryName] = remoteCategories.find(
                          (x) => x.id === value
                        );
                        setMappings(mappings);
                      }}
                    />
                  }
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
      <Button
        onClick={() => {
          navigate({
            to: "/importer/csv/summary",
          });
        }}
      >
        Continue
      </Button>
    </Stack>
  );
}
