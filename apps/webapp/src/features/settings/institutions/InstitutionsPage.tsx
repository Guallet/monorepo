import { Button, Stack, Title, Text } from "@mantine/core";
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
      <Title>User institutions</Title>
      {user_institutions.map((institution) => {
        return <Text key={institution.id}>{institution.name}</Text>;
      })}
      <Title>System institutions</Title>
      {system_institutions.map((institution) => {
        return <Text key={institution.id}>{institution.name}</Text>;
      })}
    </Stack>
  );
}
