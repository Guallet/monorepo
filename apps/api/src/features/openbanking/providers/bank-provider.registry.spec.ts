import { BankProviderRegistry } from './bank-provider.registry';

describe('provider bank country coverage', () => {
  const registry = new BankProviderRegistry(
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );

  it.each([
    {
      id: 'nordigen',
      included: ['GB', 'IS', 'LI'],
      excluded: ['US', 'NZ', 'CH'],
    },
    { id: 'synci', included: ['GB', 'NZ'], excluded: ['US', 'AU', 'CH'] },
    {
      id: 'lunchflow',
      included: ['BR', 'HK', 'SG', 'NZ', 'US'],
      excluded: ['AU', 'IN', 'CH'],
    },
    {
      id: 'banksync',
      included: ['AU', 'CA', 'GB', 'NZ', 'US'],
      excluded: ['DE', 'FR', 'CH'],
    },
  ])(
    'returns only supported bank countries for $id',
    ({ id, included, excluded }) => {
      const provider = registry.list().find((provider) => provider.id === id);
      expect(provider?.supportedCountries).toEqual(
        expect.arrayContaining(included),
      );
      for (const country of excluded) {
        expect(provider?.supportedCountries).not.toContain(country);
      }
    },
  );
});
