import { AiAgentDetailsScreen } from '@/features/settings/screens/AiAgentDetailsScreen';
import { createFileRoute } from '@tanstack/react-router';
import { Text } from '@mantine/core';

export const Route = createFileRoute('/_app/settings/ai_/$id')({
  component: AiAgentDetailsPage,
  notFoundComponent: () => {
    return <h1>Agent not found</h1>;
  },
  errorComponent: ({ error }) => {
    console.error('Error loading agent', error);
    return <Text>Error loading agent</Text>;
  },
});

function AiAgentDetailsPage() {
  const { id } = Route.useParams();
  return <AiAgentDetailsScreen agentId={id} />;
}
