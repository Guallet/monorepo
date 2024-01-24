import { getUserInstitutions } from "@/features/institutions/api/institutions.api";
import { Stack, Title, Text, Group, Badge } from "@mantine/core";
import { FileRoute } from "@tanstack/react-router";

export const Route = new FileRoute("/_app/settings/institutions/").createRoute({
  component: InstitutionsPage,
  loader: loader,
});

async function loader() {
  //   return await loadAccounts();
  const institutions = await getUserInstitutions();
  return {
    user_institutions: institutions.filter((i) => i.user_id !== null),
    system_institutions: institutions.filter((i) => i.user_id === null),
  };
}

function InstitutionsPage() {
  const { user_institutions, system_institutions } = Route.useLoaderData();

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
