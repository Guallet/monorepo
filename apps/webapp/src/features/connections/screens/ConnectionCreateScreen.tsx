import { BaseScreen } from "@/components/Screens/BaseScreen";
import {
  useConnectionMutations,
  useOpenBankingInstitutionsForCountry,
  useOpenBankingSupportedCountries,
} from "@guallet/api-react";
import {
  Autocomplete,
  AutocompleteProps,
  Text,
  Group,
  Stack,
} from "@mantine/core";
import { FlagEmoji } from "../components/FlagEmoji";
import { ObInstitutionDto, OpenBankingCountryDto } from "@guallet/api-client";
import { SearchableListView } from "@guallet/ui-react";
import { ObInstitutionRow } from "../components/ObInstitutionRow";
import { notifications } from "@mantine/notifications";

interface ConnectionCreateScreenProps {
  selectedCountryCode?: string;
  onCountryChange?: (country?: OpenBankingCountryDto) => void;
}

const renderAutocompleteOption: AutocompleteProps["renderOption"] = ({
  option,
}) => (
  <Group gap="sm">
    <FlagEmoji countryCode={option.value} />
    <Text size="sm">{option.label}</Text>
    <Text size="xs" opacity={0.5}>
      {option.value}
    </Text>
  </Group>
);

export function ConnectionCreateScreen({
  selectedCountryCode,
  onCountryChange,
}: Readonly<ConnectionCreateScreenProps>) {
  const { countries, isLoading } = useOpenBankingSupportedCountries();
  const { institutions } =
    useOpenBankingInstitutionsForCountry(selectedCountryCode);

  const countrySelected = countries.find(
    (country) => country.code === selectedCountryCode
  );

  const { createConnectionMutation } = useConnectionMutations();

  return (
    <BaseScreen>
      <Stack>
        <Autocomplete
          disabled={isLoading}
          label="Select a country"
          placeholder="Country"
          data={countries.map((country) => ({
            value: country.code,
            label: country.name,
          }))}
          renderOption={renderAutocompleteOption}
          clearable
          onClear={() => onCountryChange?.(undefined)}
          value={countrySelected?.name}
          onChange={(value) => {
            const country = countries.find((c) => c.name === value);
            if (country) {
              onCountryChange?.(country);
            }
          }}
        />
        {institutions?.length > 0 && (
          <SearchableListView
            gap={0}
            items={institutions}
            emptyView={
              <Stack p="md">
                <Text>No banks found</Text>
                <Text>
                  Some bank names are different than their commercial names.
                  Please try another name for the bank
                </Text>
              </Stack>
            }
            itemTemplate={(institution: ObInstitutionDto) => (
              <ObInstitutionRow
                institution={institution}
                onClick={() => {
                  createConnectionMutation.mutate(
                    {
                      request: {
                        institution_id: institution.id,
                        redirect_to: `${window.location.origin}/connections/connect/callback`,
                      },
                    },
                    {
                      onSuccess: (data) => {
                        // Open the website to complete the connection
                        window.open(data.link, "_self");
                      },
                      onError: (error) => {
                        console.error("Error creating connection:", error);
                        notifications.show({
                          title: "Error",
                          message:
                            "There was an error creating the connection. Please try again.",
                          color: "red",
                        });
                      },
                    }
                  );
                }}
              />
            )}
          />
        )}
      </Stack>
    </BaseScreen>
  );
}
