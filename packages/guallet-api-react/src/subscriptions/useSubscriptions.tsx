import { useQuery } from '@tanstack/react-query';
import { useGualletClient } from './../GualletClientProvider';
import { SubscriptionDto } from '@guallet/api-client';

const SUBSCRIPTIONS_QUERY_KEY = 'subscriptions';

export function useSubscriptions() {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [SUBSCRIPTIONS_QUERY_KEY],
    queryFn: async () => {
      return await gualletClient.subscriptions.getAll();
    },
  });

  return {
    subscriptions:
      query.data?.filter((dto): dto is SubscriptionDto => dto !== undefined) ??
      [],
    ...query,
  };
}

export function useSubscription(subscriptionId: string) {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [SUBSCRIPTIONS_QUERY_KEY, subscriptionId],
    queryFn: async () => {
      return await gualletClient.subscriptions.get(subscriptionId);
    },
  });

  return {
    subscription: query.data ?? null,
    ...query,
  };
}
