import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AuthorizeBankRequestDto,
  ReplaceBankCredentialsRequestDto,
  ImportBankAccountsRequestDto,
  BankJobAcceptedDto,
  CreateBankConnectionRequestDto,
} from '@guallet/api-client';
import { useGualletClient } from '../GualletClientProvider';
import { OPENBANKING_QUERY_KEY, useBankJob } from './useOpenbanking';

export function useBankConnectionMutations() {
  const client = useGualletClient();
  const cache = useQueryClient();
  const invalidate = async () => {
    await Promise.all([
      cache.invalidateQueries({ queryKey: [OPENBANKING_QUERY_KEY] }),
      cache.invalidateQueries({ queryKey: ['accounts'] }),
    ]);
  };
  const create = useMutation({
    gcTime: 0,
    mutationFn: (request: CreateBankConnectionRequestDto) =>
      client.openbanking.createConnection(request),
    onSuccess: invalidate,
  });
  const replaceCredentials = useMutation({
    gcTime: 0,
    mutationFn: ({
      id,
      credentials,
    }: ReplaceBankCredentialsRequestDto & { id: string }) =>
      client.openbanking.replaceCredentials(id, { credentials }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => client.openbanking.deleteConnection(id),
    onSuccess: async (_, id) => {
      cache.removeQueries({
        queryKey: [OPENBANKING_QUERY_KEY, 'accounts', id],
      });
      cache.removeQueries({ queryKey: [OPENBANKING_QUERY_KEY, 'jobs', id] });
      await invalidate();
    },
  });
  const unlink = useMutation({
    mutationFn: ({ id, accountId }: { id: string; accountId: string }) =>
      client.openbanking.unlinkAccount(id, accountId),
    onSuccess: invalidate,
  });
  const authorize = useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: string;
      request: AuthorizeBankRequestDto;
    }) => client.openbanking.authorize(id, request),
  });
  const completeAuthorization = useMutation({
    mutationFn: ({
      id,
      authorizationId,
    }: {
      id: string;
      authorizationId: string;
    }) => client.openbanking.completeAuthorization(id, authorizationId),
    onSuccess: invalidate,
  });
  return {
    create,
    replaceCredentials,
    remove,
    unlink,
    authorize,
    completeAuthorization,
  };
}

type BankOperationInput =
  | { operation: 'refresh' | 'sync' }
  | ({ operation: 'import' } & ImportBankAccountsRequestDto);

export function useBankOperation(id?: string) {
  const client = useGualletClient();
  const start = useMutation({
    mutationFn: async (request: BankOperationInput) => {
      if (!id) throw new Error('Select a bank connection');
      let job: BankJobAcceptedDto;
      if (request.operation === 'import') {
        job = await client.openbanking.importAccounts(id, {
          accountIds: request.accountIds,
        });
      } else if (request.operation === 'sync') {
        job = await client.openbanking.syncAccounts(id);
      } else {
        job = await client.openbanking.refreshAccounts(id);
      }
      return { ...job, connectionId: id };
    },
  });
  const job = useBankJob(start.data?.connectionId, start.data?.jobId);
  const busy =
    start.isPending ||
    Boolean(
      start.data &&
      !job.isError &&
      job.data?.status !== 'completed' &&
      job.data?.status !== 'failed',
    );
  return { start, job, busy };
}
