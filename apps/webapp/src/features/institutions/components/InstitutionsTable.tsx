import React, { useMemo, useState } from 'react';
import { InstitutionDto } from '@guallet/api-client';
import { TextInput, Button, Table, Image, Group, Space } from '@mantine/core';

interface InstitutionsTableProps {
  institutions: InstitutionDto[];
}

const InstitutionsTable: React.FC<InstitutionsTableProps> = ({
  institutions,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredInstitutions = useMemo(() => {
    let results = institutions;

    if (searchTerm) {
      results = results.filter((institution) =>
        institution.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return results;
  }, [institutions, searchTerm]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const rows = filteredInstitutions.map((institution) => (
    <tr key={institution.id}>
      <td>
        <Image src={institution.image_src} alt={institution.name} width={50} />
      </td>
      <td>{institution.name}</td>
    </tr>
  ));

  return (
    <div>
      <Group justify="space-between">
        <TextInput
          placeholder="Search by name"
          value={searchTerm}
          onChange={handleSearch}
        />
        <Button>Create New Institution</Button>
      </Group>
      <Space h="md" />
      <Table striped>
        <thead>
          <tr>
            <th>Logo</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </div>
  );
};

export default InstitutionsTable;
