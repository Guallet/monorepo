import React, { useState, useEffect } from "react";
import { InstitutionDto } from "@guallet/api-client";
import {
  TextInput,
  Select,
  Button,
  Table,
  Image,
  Group,
  Stack,
  Paper,
  Badge,
  ActionIcon,
  Tooltip,
  Text,
  rem,
  Box,
} from "@mantine/core";
import {
  IconSearch,
  IconEdit,
  IconTrash,
  IconPlus,
} from "@tabler/icons-react";

interface InstitutionsTableProps {
  institutions: InstitutionDto[];
  onCreateClick: () => void;
  onEditClick: (institution: InstitutionDto) => void;
  onDeleteClick: (institution: InstitutionDto) => void;
}

const InstitutionsTable: React.FC<InstitutionsTableProps> = ({
  institutions,
  onCreateClick,
  onEditClick,
  onDeleteClick,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [userInstitutionFilter, setUserInstitutionFilter] = useState<
    "user" | "system" | "all"
  >("all");
  const [filteredInstitutions, setFilteredInstitutions] =
    useState<InstitutionDto[]>(institutions);

  useEffect(() => {
    let results = institutions;

    if (searchTerm) {
      results = results.filter((institution) =>
        institution.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (countryFilter) {
      results = results.filter((institution) =>
        institution.countries.includes(countryFilter)
      );
    }

    if (userInstitutionFilter === "user") {
      results = results.filter((institution) => institution.user_id !== null);
    } else if (userInstitutionFilter === "system") {
      results = results.filter((institution) => institution.user_id === null);
    }

    setFilteredInstitutions(results);
  }, [institutions, searchTerm, countryFilter, userInstitutionFilter]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCountryFilter = (value: string | null) => {
    setCountryFilter(value ?? "");
  };

  const handleUserInstitutionFilter = (value: string | null) => {
    setUserInstitutionFilter((value ?? "all") as "user" | "system" | "all");
  };

  const rows = filteredInstitutions.map((institution) => (
    <Table.Tr key={institution.id}>
      <Table.Td>
        <Image
          src={institution.image_src}
          alt={institution.name}
          width={50}
          height={50}
          fit="contain"
          fallbackSrc="https://placehold.co/50x50?text=No+Image"
        />
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Text fw={500}>{institution.name}</Text>
          {institution.user_id && (
            <Badge size="xs" color="blue">
              Custom
            </Badge>
          )}
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          {institution.countries.map((country) => (
            <Badge key={country} variant="light" size="sm">
              {country}
            </Badge>
          ))}
        </Group>
      </Table.Td>
      <Table.Td>
        {institution.user_id && (
          <Group gap="xs">
            <Tooltip label="Edit institution">
              <ActionIcon
                variant="light"
                color="blue"
                onClick={() => onEditClick(institution)}
              >
                <IconEdit style={{ width: rem(16), height: rem(16) }} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Delete institution">
              <ActionIcon
                variant="light"
                color="red"
                onClick={() => onDeleteClick(institution)}
              >
                <IconTrash style={{ width: rem(16), height: rem(16) }} />
              </ActionIcon>
            </Tooltip>
          </Group>
        )}
      </Table.Td>
    </Table.Tr>
  ));

  const countries = Array.from(
    new Set(institutions.map((institution) => institution.countries).flat())
  ).sort();

  return (
    <Stack gap="md">
      <Paper p="md" withBorder radius="md">
        <Stack gap="md">
          <Group justify="space-between" wrap="wrap">
            <TextInput
              placeholder="Search by name..."
              value={searchTerm}
              onChange={handleSearch}
              leftSection={<IconSearch size={16} />}
              style={{ flex: 1, minWidth: rem(200) }}
            />
            <Select
              value={userInstitutionFilter}
              onChange={handleUserInstitutionFilter}
              data={[
                { value: "all", label: "All Institutions" },
                { value: "user", label: "Custom Only" },
                { value: "system", label: "System Only" },
              ]}
              style={{ minWidth: rem(180) }}
            />
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={onCreateClick}
            >
              Create Institution
            </Button>
          </Group>
          
          <Box>
            <Text size="sm" c="dimmed">
              Showing {filteredInstitutions.length} of {institutions.length}{" "}
              institutions
            </Text>
          </Box>
        </Stack>
      </Paper>

      <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Logo</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Countries</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Text ta="center" c="dimmed" py="xl">
                    No institutions found
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
};

export default InstitutionsTable;
