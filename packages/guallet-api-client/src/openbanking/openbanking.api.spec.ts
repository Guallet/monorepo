import { afterEach, describe, expect, it, vi } from 'vitest';
import { GualletClientImpl } from '../GualletClient';
import type {
  AuthorizeBankRequestDto,
  BankAccountsDto,
  BankAuthorizationDto,
  BankConnectionDto,
  BankJobAcceptedDto,
  BankProviderDto,
  CreateBankConnectionRequestDto,
  ImportBankAccountsRequestDto,
  ReplaceBankCredentialsRequestDto,
} from './openbanking.models';

const connection: BankConnectionDto = {
  id: 'connection',
  providerId: 'synci',
  status: 'configured',
  credentialHint: '1234',
  accountsRefreshedAt: null,
  lastSyncedAt: null,
};
const accepted: BankJobAcceptedDto = { jobId: 'job' };
const create: CreateBankConnectionRequestDto = {
  providerId: 'synci',
  credentials: { apiKey: 'key' },
};
const replace: ReplaceBankCredentialsRequestDto = {
  credentials: { apiKey: 'replacement' },
};
const selected: ImportBankAccountsRequestDto = { accountIds: ['remote'] };
const authorizationRequest: AuthorizeBankRequestDto = {
  institutionId: 'bank',
  redirectUrl: 'https://app.example/callback',
};
const authorization: BankAuthorizationDto = {
  id: 'authorization',
  action: 'redirect',
  redirectUrl: 'https://bank.example/consent',
};

function setup(response: unknown, status = 200) {
  const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(status === 204 ? null : JSON.stringify(response), {
      status,
    }),
  );
  const client = new GualletClientImpl({ baseUrl: 'https://api.example' });
  return { fetch, api: client.openbanking };
}

describe('openbanking API request contracts', () => {
  afterEach(() => vi.restoreAllMocks());

  it.each([
    {
      name: 'create',
      method: 'POST',
      path: '/openbanking/connections',
      payload: create,
      response: connection,
      run: (api: GualletClientImpl['openbanking']) =>
        api.createConnection(create),
    },
    {
      name: 'replace credentials',
      method: 'PUT',
      path: '/openbanking/connections/connection/credentials',
      payload: replace,
      response: connection,
      run: (api: GualletClientImpl['openbanking']) =>
        api.replaceCredentials('connection', replace),
    },
    {
      name: 'import accounts',
      method: 'POST',
      path: '/openbanking/connections/connection/accounts/import',
      payload: selected,
      response: accepted,
      run: (api: GualletClientImpl['openbanking']) =>
        api.importAccounts('connection', selected),
    },
    {
      name: 'refresh accounts',
      method: 'POST',
      path: '/openbanking/connections/connection/accounts/refresh',
      payload: {},
      response: accepted,
      run: (api: GualletClientImpl['openbanking']) =>
        api.refreshAccounts('connection'),
    },
    {
      name: 'sync accounts',
      method: 'POST',
      path: '/openbanking/connections/connection/sync',
      payload: {},
      response: accepted,
      run: (api: GualletClientImpl['openbanking']) =>
        api.syncAccounts('connection'),
    },
    {
      name: 'authorize',
      method: 'POST',
      path: '/openbanking/connections/connection/authorizations',
      payload: authorizationRequest,
      response: authorization,
      run: (api: GualletClientImpl['openbanking']) =>
        api.authorize('connection', authorizationRequest),
    },
    {
      name: 'complete authorization',
      method: 'POST',
      path: '/openbanking/connections/connection/authorizations/authorization/complete',
      payload: {},
      response: accepted,
      run: (api: GualletClientImpl['openbanking']) =>
        api.completeAuthorization('connection', 'authorization'),
    },
  ])(
    'sends the API request DTO for $name',
    async ({ method, path, payload, response, run }) => {
      const { api, fetch } = setup(response);
      await expect(run(api)).resolves.toEqual(response);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.example' + path,
        expect.objectContaining({ method, body: JSON.stringify(payload) }),
      );
    },
  );

  it('reads the supported country and credential field DTOs', async () => {
    const providers: BankProviderDto[] = [
      {
        id: 'synci',
        name: 'Synci',
        supportsBankAuthorization: false,
        supportedCountries: ['GB', 'NZ'],
        credentialFields: [{ name: 'apiKey', secret: true }],
      },
    ];
    const { api } = setup(providers);
    await expect(api.getProviders()).resolves.toEqual(providers);
  });

  it('reads discovered accounts with nullable and optional DTO fields', async () => {
    const accounts: BankAccountsDto = {
      refreshedAt: '2026-11-08T10:00:00.000Z',
      accounts: [
        {
          id: 'remote',
          name: 'Current',
          institutionName: null,
          currency: null,
          linkedAccountId: null,
        },
      ],
    };
    const { api } = setup(accounts);
    await expect(api.getAccounts('connection')).resolves.toEqual(accounts);
  });

  it('handles the API no-content response when disconnecting', async () => {
    const { api } = setup(undefined, 204);
    await expect(api.deleteConnection('connection')).resolves.toBeUndefined();
  });
});
