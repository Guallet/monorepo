import { Stack, Table, Select, Button } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import { useAtomValue, useAtom } from "jotai";
import { csvAccountsAtom, accountMappingsAtom } from "../state/csvState";
import { useAccounts } from "@guallet/api-react";

export const DEFAULT_ACCOUNT_NAME = "account";

export function CsvAccountsScreen() {
  const navigate = useNavigate();

  const { accounts: remoteAccounts } = useAccounts();
  const availableAccounts = [null, ...remoteAccounts];
  const csvAccounts = useAtomValue(csvAccountsAtom);
  const [mappings, setMappings] = useAtom(accountMappingsAtom);

  return (
    <Stack>
      <p>Accounts</p>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Imported Account</Table.Th>
            <Table.Th>Destination Account</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {csvAccounts.length === 0 ? (
            <Table.Tr>
              <Table.Td>Source Account</Table.Td>
              <Table.Td>
                {
                  <Select
                    placeholder="Select the destination account"
                    data={availableAccounts.map(
                      (x) => x?.name ?? "Map to a new account"
                    )}
                    onChange={(value) => {
                      // Map account X to value
                      mappings[DEFAULT_ACCOUNT_NAME] = remoteAccounts.find(
                        (x) => x.name === value
                      );
                      setMappings(mappings);
                    }}
                  />
                }
              </Table.Td>
            </Table.Tr>
          ) : (
            csvAccounts.map((x) => {
              return (
                <Table.Tr key={x ?? "source"}>
                  <Table.Td>{x ?? "Source Account"}</Table.Td>
                  <Table.Td>
                    {
                      <Select
                        placeholder="Select the destination account"
                        data={availableAccounts.map(
                          (x) => x?.name ?? "Map to a new account"
                        )}
                        onChange={(value) => {
                          // Map account X to value
                          mappings[x] = remoteAccounts.find(
                            (x) => x.name === value
                          );
                          setMappings(mappings);
                        }}
                      />
                    }
                  </Table.Td>
                </Table.Tr>
              );
            })
          )}
        </Table.Tbody>
      </Table>
      <Button
        onClick={() => {
          navigate({
            to: "/importer/csv/categories",
          });
        }}
      >
        Continue
      </Button>
    </Stack>
  );
}
