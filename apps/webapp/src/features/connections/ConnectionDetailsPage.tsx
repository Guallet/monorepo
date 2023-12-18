import {
  Avatar,
  Button,
  Group,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { LoaderFunction, useLoaderData } from "react-router-dom";
import {
  ObAccountDto,
  ObConnection,
  getInstitution,
  getObAccounts,
  loadConnection,
} from "./api/connections.api";
import { InstitutionDto } from "../settings/institutions/api/institutions.api";

type LoaderData = {
  connection: ObConnection;
  institution: InstitutionDto;
  accounts: ObAccountDto[];
};

export const loader: LoaderFunction = async ({ params }) => {
  const { id } = params;
  if (!id) {
    throw Error("Invalid navigation args");
  }

  const connection = await loadConnection(id);
  const institution = await getInstitution(connection.institution_id);
  const accounts = await getObAccounts(id);

  return {
    connection: connection,
    institution: institution,
    accounts: accounts,
  } as LoaderData;
};

export function ConnectionDetailsPage() {
  const { connection, accounts, institution } = useLoaderData() as LoaderData;

  return (
    <Stack>
      <Group>
        <Tooltip label={institution.name}>
          <Avatar src={institution.image_src} alt={institution.name} />
        </Tooltip>
        <Title>{institution.name}</Title>
      </Group>
      <Stack>
        <Text>Accounts: </Text>
        {accounts.map((a) => {
          return (
            <Stack key={a.id}>
              <Text>{a.name ?? a.ownerName}</Text>
              <Text>Details: {a.details}</Text>
              <Text>Account type: {a.cashAccountType}</Text>
              <Text>Currency: {a.currency}</Text>
            </Stack>
          );
        })}
      </Stack>
      <Button>Refresh connection</Button>
      <Button>Update data now</Button>
      <Button color="red">Delete connection</Button>
    </Stack>
  );
}
