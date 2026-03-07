import { BaseScreen } from '@/components/Screens/BaseScreen';
import { notifications } from '@/lib/notifications';
import { ObInstitutionDto, OpenBankingCountryDto } from '@guallet/api-client';
import {
  useConnectionMutations,
  useOpenBankingInstitutionsForCountry,
  useOpenBankingSupportedCountries,
} from '@guallet/api-react';
import { useMemo, useState } from 'react';
import { FlagEmoji } from '../components/FlagEmoji';
import { ObInstitutionRow } from '../components/ObInstitutionRow';

interface ConnectionCreateScreenProps {
  selectedCountryCode?: string;
  onCountryChange?: (country?: OpenBankingCountryDto) => void;
}

export function ConnectionCreateScreen({
  selectedCountryCode,
  onCountryChange,
}: Readonly<ConnectionCreateScreenProps>) {
  const { countries, isLoading } = useOpenBankingSupportedCountries();
  const { institutions: fetchedInstitutions } =
    useOpenBankingInstitutionsForCountry(selectedCountryCode);
  const institutions = useMemo(
    () => fetchedInstitutions ?? [],
    [fetchedInstitutions],
  );
  const [searchTerm, setSearchTerm] = useState('');

  const countrySelected = countries.find(
    (country) => country.code === selectedCountryCode,
  );

  const { createConnectionMutation } = useConnectionMutations();

  const filteredInstitutions = useMemo(() => {
    if (!searchTerm.trim()) {
      return institutions;
    }

    const normalizedSearchTerm = searchTerm.toLowerCase();
    return institutions.filter((institution) =>
      institution.name.toLowerCase().includes(normalizedSearchTerm),
    );
  }, [institutions, searchTerm]);

  const hasSelectedCountry = Boolean(selectedCountryCode);
  const showInstitutionList = hasSelectedCountry && institutions.length > 0;
  const showNoInstitutionsMessage = hasSelectedCountry && institutions.length === 0;

  const handleInstitutionClick = (institution: ObInstitutionDto) => {
    createConnectionMutation.mutate(
      {
        request: {
          institution_id: institution.id,
          redirect_to: `${globalThis.location.origin}/connections/connect/callback`,
        },
      },
      {
        onSuccess: (data) => {
          globalThis.open(data.link, '_self');
        },
        onError: (error) => {
          console.error('Error creating connection:', error);
          notifications.show({
            title: 'Error',
            message:
              'There was an error creating the connection. Please try again.',
            color: 'red',
          });
        },
      },
    );
  };

  return (
    <BaseScreen isLoading={isLoading}>
      <div className="space-y-4">
        <div className="grid gap-2">
          <label htmlFor="connection-country" className="text-sm font-medium">
            Select a country
          </label>
          <select
            id="connection-country"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={selectedCountryCode ?? ''}
            onChange={(event) => {
              const value = event.currentTarget.value;

              if (!value) {
                onCountryChange?.(undefined);
                return;
              }

              const country = countries.find((item) => item.code === value);
              if (country) {
                onCountryChange?.(country);
              }
            }}
          >
            <option value="">Country</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name} ({country.code})
              </option>
            ))}
          </select>
        </div>

        {countrySelected ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <FlagEmoji countryCode={countrySelected.code} />
            <span>
              Selected country: <strong>{countrySelected.name}</strong>
            </span>
          </p>
        ) : null}

        {showInstitutionList ? (
          <div className="space-y-3">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.currentTarget.value);
              }}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              placeholder="Search bank by name"
            />

            {filteredInstitutions.length > 0 ? (
              <div className="rounded-md border">
                {filteredInstitutions.map((institution) => (
                  <ObInstitutionRow
                    key={institution.id}
                    institution={institution}
                    onClick={() => {
                      handleInstitutionClick(institution);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">No banks found</p>
                <p>
                  Some bank names are different than their commercial names.
                  Please try another name for the bank.
                </p>
              </div>
            )}
          </div>
        ) : null}

        {showNoInstitutionsMessage ? (
          <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
            No institutions available for this country.
          </div>
        ) : null}
      </div>
    </BaseScreen>
  );
}
