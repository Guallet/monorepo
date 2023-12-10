import { Stack, Title, Text, Group, Badge } from "@mantine/core";
import { useLoaderData } from "react-router-dom";
import { InstitutionDto, getUserInstitutions } from "./api/institutions.api";

type LoaderData = {
  system_institutions: InstitutionDto[];
  user_institutions: InstitutionDto[];
};

export async function loader() {
  //   return await loadAccounts();
  const institutions = await getUserInstitutions();
  return {
    user_institutions: institutions.filter((i) => i.user_id !== null),
    system_institutions: institutions.filter((i) => i.user_id === null),
  } as LoaderData;
}

export function InstitutionsPage() {
  const { user_institutions, system_institutions } =
    useLoaderData() as LoaderData;

  return (
    <Stack>
      <Group>
        <Title>User institutions</Title>
        <Badge color="red">{user_institutions.length}</Badge>
      </Group>
      {user_institutions.map((institution) => {
        return <Text key={institution.id}>{institution.name}</Text>;
      })}
      <Group>
        <Title>System institutions</Title>
        <Badge variant="light">{system_institutions.length}</Badge>
      </Group>
      {system_institutions.map((institution) => {
        return <Text key={institution.id}>{institution.name}</Text>;
      })}
    </Stack>
  );
}
