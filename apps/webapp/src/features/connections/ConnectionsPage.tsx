import {
  ActionIcon,
  Avatar,
  Button,
  Group,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { LoaderFunction, useLoaderData, useNavigate } from "react-router-dom";
import {
  ObConnection,
  getInstitution,
  loadConnections,
} from "./api/connections.api";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { InstitutionDto } from "../settings/institutions/api/institutions.api";

type LoaderData = {
  connections: ObConnection[];
  institutions: InstitutionDto[];
};

export const loader: LoaderFunction = async () => {
  const connections = await loadConnections();

  // Load the institutions from the API to get the src for the logo
  const institutions: InstitutionDto[] = [];
  for (const institutionId of connections.map((c) => c.institution_id)) {
    const institution = await getInstitution(institutionId);
    institutions.push(institution);
  }

  return {
    connections: connections,
    institutions: institutions,
  } as LoaderData;
};

export function ConnectionsPage() {
  const { connections, institutions } = useLoaderData() as LoaderData;
  const navigate = useNavigate();

  if (connections.length === 0) return <EmptyConnectionsView />;

  return (
    <Stack>
      <Title>Connections</Title>
      <Button
        onClick={() => {
          navigate("/connections/connect");
        }}
      >
        Add a new connection
      </Button>

      <ConnectionsTable connections={connections} institutions={institutions} />
    </Stack>
  );
}

function getStatusLabel(status: string) {
  if (status === "CR") return "CREATED";
  if (status === "GC") return "GIVING_CONSENT";
  if (status === "UA") return "UNDERGOING_AUTHENTICATION";
  if (status === "RJ") return "REJECTED";
  if (status === "SA") return "SELECTING_ACCOUNTS";
  if (status === "GA") return "GRANTING_ACCESS";
  if (status === "LN") return "LINKED";
  if (status === "EX") return "EXPIRED";
  return status;
}

function getStatusTooltip(status: string) {
  if (status === "CR") return "Requisition has been successfully created";
  if (status === "GC")
    return "End-user is giving consent at GoCardless's consent screen";
  if (status === "UA")
    return "End-user is redirected to the financial institution for authentication";
  if (status === "RJ")
    return "Either SSN verification has failed or end-user has entered incorrect credentials";
  if (status === "SA") return "End-user is selecting accounts";
  if (status === "GA")
    return "End-user is granting access to their account information";
  if (status === "LN")
    return "Account has been successfully linked to requisition";
  if (status === "EX")
    return "Access to accounts has expired as set in End User Agreement";

  return status;
}

function EmptyConnectionsView() {
  const navigate = useNavigate();
  return (
    <Stack>
      <Button
        onClick={() => {
          navigate("/connections/connect");
        }}
      >
        Add your first connection
      </Button>
    </Stack>
  );
}

export function ConnectionsTable({
  connections,
  institutions,
}: {
  connections: ObConnection[];
  institutions: InstitutionDto[];
}) {
  const navigate = useNavigate();

  const rows = connections.map((connection) => (
    <ConnectionTableRow
      key={connection.id}
      connection={connection}
      institutions={institutions}
      onClick={() => {
        navigate(`/connections/${connection.id}`);
      }}
    />
  ));

  return (
    <Table stickyHeader striped highlightOnHover withColumnBorders>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Institution</Table.Th>
          <Table.Th>Accounts</Table.Th>
          <Table.Th>Status</Table.Th>
          <Table.Th>Created</Table.Th>
          <Table.Th>Expires in</Table.Th>
          {/* <Table.Th>Actions</Table.Th> */}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
}

export function ConnectionTableRow({
  connection,
  institutions,
  onClick,
}: {
  connection: ObConnection;
  institutions: InstitutionDto[];
  onClick: (connection: ObConnection) => void;
}) {
  const institution = institutions.find(
    (x) => x.nordigen_id === connection.institution_id
  );

  return (
    <Table.Tr
      key={connection.id}
      onClick={() => {
        onClick(connection);
      }}
    >
      <Table.Td>
        <Group>
          <Tooltip label={institution?.name}>
            <Avatar radius="sm" src={institution?.image_src} />
          </Tooltip>
          <Text>
            {institutions.find((x) => x.id === connection.institution_id)?.name}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text>{connection.accounts.length}</Text>
      </Table.Td>
      <Table.Td>
        <Tooltip label={getStatusTooltip(connection.status)}>
          <Text>{getStatusLabel(connection.status)}</Text>
        </Tooltip>
      </Table.Td>
      <Table.Td>
        <Text>{new Date(connection.created).toLocaleDateString()}</Text>
      </Table.Td>
      <Table.Td>
        {/* <Text>{connection.agreement} days left</Text> */}
        <Text>X days left</Text>
      </Table.Td>
      {/* <Table.Td>
        <Group>
          <Tooltip label="Edit">
            <ActionIcon>
              <IconEdit />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete">
            <ActionIcon color="red">
              <IconTrash />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td> */}
    </Table.Tr>
  );
}
