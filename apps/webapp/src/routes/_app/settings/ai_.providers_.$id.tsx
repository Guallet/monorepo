import { AiProviderDetailsScreen } from '@/features/settings/screens/AiProviderDetailsScreen';
import { Text } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/settings/ai_/providers_/$id')({
  component: AiProviderDetailsPage,
  errorComponent: ({ error }) => {
    console.error('Error loading AI provider', error);
    return (
      <>
        <Text>Unable to load AI provider.</Text>
        <Text>{`${JSON.stringify(error)}`}</Text>
      </>
    );
  },
});

function AiProviderDetailsPage() {
  const { id } = Route.useParams();

  return <AiProviderDetailsScreen connectionId={id} />;
}
