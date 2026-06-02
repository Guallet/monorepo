import { AiAgentDetailsScreen } from '@/features/settings/screens/AiAgentDetailsScreen';
import { createFileRoute } from '@tanstack/react-router';
import { Stack, Text } from '@mantine/core';

export const Route = createFileRoute('/_app/settings/ai_/$id')({
  component: AiAgentDetailsPage,
  notFoundComponent: () => {
    return <h1>Agent not found</h1>;
  },
  errorComponent: ({ error }) => {
    console.error('Error loading agent', error);
    return (
      <Stack>
        <Text>Error loading agent</Text>
        <Text>{`${JSON.stringify(error)}`}</Text>
      </Stack>
    );
  },
});

function AiAgentDetailsPage() {
  const { id } = Route.useParams();
  return <AiAgentDetailsScreen agentId={id} />;
}
