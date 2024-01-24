import { FileRoute, useNavigate } from "@tanstack/react-router";

import {
  Avatar,
  ComboboxItem,
  Group,
  OptionsFilter,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";

import { SearchableListView } from "@guallet/ui-react";
import { useState } from "react";
import {
  InstitutionDto,
  createConnection,
  getInstitutions,
  getSupportedCountries,
} from "@/features/connections/api/connections.api";

import { z } from "zod";
const pageSearchSchema = z.object({
  country: z.string().optional(), //.catch("GB"),
});

export const Route = new FileRoute("/_app/connections/connect/").createRoute({
  component: AddConnectionPage,
  validateSearch: pageSearchSchema,
  loaderDeps: ({ search: { country } }) => ({ country }),
  loader: async ({ deps: { country } }) => loader({ country }),
});

async function loader(args: { country: string | undefined }) {
  const countries = await getSupportedCountries();
  const { country } = args;
  let banks: InstitutionDto[] = [];

  if (country) {
    banks = await getInstitutions(country);
  }

  return {
    countries: countries,
    selectedCountry: country,
    banks: banks,
  };
}

export function AddConnectionPage() {
  const navigate = useNavigate({ from: Route.fullPath });

  const { countries, selectedCountry, banks } = Route.useLoaderData();

  const [isLoading, setIsLoading] = useState(false);

  function selectedCountryChange(value: string | null) {
    if (!value) {
      return;
    } else {
      const country = countries.find((country) => country.name === value);

      if (country) {
        navigate({
          search: () => ({
            country: country?.code ?? undefined,
          }),
        });
      } else {
        console.error("Country not found", value);
      }
    }
  }

  async function onCreateConnection(institution: InstitutionDto) {
    // Create the requisition request and navigate to the link returned by the request
    console.log("Creating connection to", institution);

    setIsLoading(true);
    try {
      const response = await createConnection(institution.id);
      console.log("Response", response);
      response.link && window.open(response.link, "_self");
      // if (response.link) {
      //   window.location.href = response.link;
      // }
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  }

  return (
    <Stack>
      <Title>Connect to a bank</Title>
      <Select
        label="Select a country"
        placeholder="Pick a country"
        data={countries.map((country) => country.name)}
        value={
          selectedCountry !== null
            ? countries.find((x) => x.code === selectedCountry)?.name
            : ""
        }
        filter={optionsFilter}
        searchable
        nothingFoundMessage="No countries found"
        checkIconPosition="right"
        allowDeselect={false}
        withScrollArea={false}
        styles={{ dropdown: { maxHeight: 200, overflowY: "auto" } }}
        mt="md"
        onChange={(value) => {
          selectedCountryChange(value);
        }}
      />
      {selectedCountry && (
        <SearchableListView
          items={banks}
          emptyView={
            <Stack>
              <Text>No banks found</Text>
              <Text>
                Some bank names are different than their commercial names.
                Please try another name for the bank
              </Text>
            </Stack>
          }
          itemTemplate={(institution: InstitutionDto) => {
            return (
              <InstitutionRow
                key={institution.id}
                institution={institution}
                onRowSelected={(institution: InstitutionDto) => {
                  onCreateConnection(institution);
                }}
              />
            );
          }}
        />
      )}
    </Stack>
  );
}

const optionsFilter: OptionsFilter = ({ options, search }) => {
  const splittedSearch = search.toLowerCase().trim().split(" ");
  return (options as ComboboxItem[]).filter((option) => {
    const words = option.label.toLowerCase().trim().split(" ");
    return splittedSearch.every((searchWord) =>
      words.some((word) => word.includes(searchWord))
    );
  });
};

interface InstitutionRowProps {
  institution: InstitutionDto;
  onRowSelected: (institution: InstitutionDto) => void;
}
function InstitutionRow({ institution, onRowSelected }: InstitutionRowProps) {
  return (
    <Group
      onClick={() => {
        onRowSelected(institution);
      }}
    >
      <Avatar src={institution.logo} alt={institution.name} radius="sm" />
      <Text>{institution.name}</Text>
    </Group>
  );
}
