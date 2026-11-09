import { createFileRoute } from '@tanstack/react-router';
import { ConnectionsScreen } from '@/features/openbanking/screens/ConnectionsScreen';

export const Route = createFileRoute('/_app/settings/connections')({
  component: ConnectionsScreen,
});
