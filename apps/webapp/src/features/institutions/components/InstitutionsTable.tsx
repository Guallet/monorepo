import React, { useMemo, useState } from 'react';
import { InstitutionDto } from '@guallet/api-client';
import {
  TextInput,
  Select,
  Button,
  Table,
  Image,
  Group,
  Space,
} from '@mantine/core';

interface InstitutionsTableProps {
  institutions: InstitutionDto[];
}

const InstitutionsTable: React.FC<InstitutionsTableProps> = ({
  institutions,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [userInstitutionFilter, setUserInstitutionFilter] = useState<
    'user' | 'system' | 'all'
  >('all');
  const filteredInstitutions = useMemo(() => {
    let results = institutions;

    if (searchTerm) {
      results = results.filter((institution) =>
        institution.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (countryFilter) {
      results = results.filter((institution) =>
        institution.countries.includes(countryFilter),
      );
    }

    if (userInstitutionFilter === 'user') {
      results = results.filter((institution) => institution.user_id !== null);
    } else if (userInstitutionFilter === 'system') {
      results = results.filter((institution) => institution.user_id === null);
    }

    return results;
  }, [institutions, searchTerm, countryFilter, userInstitutionFilter]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCountryFilter = (value: string | null) => {
    setCountryFilter(value ?? '');
  };

  const handleUserInstitutionFilter = (value: string | null) => {
    setUserInstitutionFilter((value ?? 'all') as 'user' | 'system' | 'all');
  };

  const rows = filteredInstitutions.map((institution) => (
    <tr key={institution.id}>
      <td>
        <Image src={institution.image_src} alt={institution.name} width={50} />
      </td>
      <td>{institution.name}</td>
      <td>{institution.countries}</td>
      <td>
        {institution.user_id && (
          <Group gap="xs">
            <Button size="xs">Edit</Button>
            <Button size="xs" color="red">
              Remove
            </Button>
          </Group>
        )}
      </td>
    </tr>
  ));

  const countries = useMemo(
    () =>
      Array.from(
        new Set(
          institutions
            .flatMap((institution) => institution.countries)
            .filter(
              (country): country is string =>
                typeof country === 'string' && country.trim() !== '',
            ),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [institutions],
  );

  return (
    <div>
      <Group justify="space-between">
        <TextInput
          placeholder="Search by name"
          value={searchTerm}
          onChange={handleSearch}
        />
        <Select
          value={countryFilter}
          onChange={handleCountryFilter}
          data={[{ value: '', label: 'All Countries' }].concat(
            countries.map((country) => ({ value: country, label: country })),
          )}
        />
        <Select
          value={userInstitutionFilter}
          onChange={handleUserInstitutionFilter}
          data={[
            { value: 'all', label: 'All Institutions' },
            { value: 'user', label: 'User Institutions' },
            { value: 'system', label: 'System Institutions' },
          ]}
        />
        <Button>Create New Institution</Button>
      </Group>
      <Space h="md" />
      <Table striped>
        <thead>
          <tr>
            <th>Logo</th>
            <th>Name</th>
            <th>Countries</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </div>
  );
};

export default InstitutionsTable;
