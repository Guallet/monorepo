import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGualletClient } from "./../GualletClientProvider";
import { RecurringPaymentDto } from "@guallet/api-client/src/recurringPayments";

const RECURRING_PAYMENTS_QUERY_KEY = "recurringPayments";
const DETECTED_RECURRING_PAYMENTS_QUERY_KEY = "detectedRecurringPayments";

export function useRecurringPayments() {
  const gualletClient = useGualletClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [RECURRING_PAYMENTS_QUERY_KEY],
    queryFn: async () => {
      const payments = await gualletClient.recurringPayments.getAll();
      // Fill the cache with individual payments
      payments.forEach((payment) => {
        queryClient.setQueryData(
          [RECURRING_PAYMENTS_QUERY_KEY, payment.id],
          payment
        );
      });
      return payments;
    },
  });

  return {
    recurringPayments:
      query.data?.filter(
        (dto): dto is RecurringPaymentDto => dto !== undefined
      ) ?? [],
    ...query,
  };
}

export function useRecurringPayment(id: string) {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [RECURRING_PAYMENTS_QUERY_KEY, id],
    queryFn: async () => {
      return await gualletClient.recurringPayments.get(id);
    },
  });

  return {
    recurringPayment: query.data ?? null,
    ...query,
  };
}

export function useDetectedRecurringPayments() {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [DETECTED_RECURRING_PAYMENTS_QUERY_KEY],
    queryFn: async () => {
      return await gualletClient.recurringPayments.detectRecurringPayments();
    },
    // Don't refetch automatically since this is an expensive operation
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    detectedPayments: query.data ?? [],
    ...query,
  };
}

export function useSuggestedTransactions() {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: ["suggestedTransactions"],
    queryFn: async () => {
      return await gualletClient.recurringPayments.getSuggestedTransactions();
    },
    // Don't refetch automatically since this is an expensive operation
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    suggestedTransactions: query.data ?? [],
    ...query,
  };
}
