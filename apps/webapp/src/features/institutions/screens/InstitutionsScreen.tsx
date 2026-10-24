import { useInstitutions } from '@guallet/api-react';
import InstitutionsTable from '../components/InstitutionsTable';
import { Stack } from '@mantine/core';

export function InstitutionsScreen() {
  const { institutions } = useInstitutions();

  return (
    <Stack>
      <InstitutionsTable institutions={institutions} />
    </Stack>
  );
}
